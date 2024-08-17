using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Common.DTO;
using Web1.JWT;
using System.IO;
using static System.Net.Mime.MediaTypeNames;
using Common;
using Common.Model;
using AutoMapper;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json.Linq;

namespace Web1.Controllers
{
    [Route("taxi/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly JWT.JWT jwt;
        private readonly AzureStorageService storageService;
        private readonly IMapper _mapper;

        public UserController(IMapper mapper, JWT.JWT jwt)
        {
            this.jwt = jwt;
            storageService = new AzureStorageService();
            _mapper = mapper;
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginModel)
        {
            return Ok(new { token = jwt.GenerateToken(loginModel.username) });
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromForm] UserDTO userDto)
        {
            // check if exists
            var table = storageService.GetTable("Users");
            var result1 = table.GetEntityIfExists<User>(userDto.username, userDto.username);
            if (result1.HasValue) { return NotFound(); }

                // save image
            if (userDto.image != null)
            {
                    string tempImageFolder = Path.Combine(Directory.GetCurrentDirectory(), "TempImages");
                    if (!Directory.Exists(tempImageFolder))
                    {
                        Directory.CreateDirectory(tempImageFolder);
                    }

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(userDto.image.FileName);
                    string pathToSave = Path.Combine(tempImageFolder, uniqueFileName);

                    using (var stream = new FileStream(pathToSave, FileMode.Create))
                    {
                        await userDto.image.CopyToAsync(stream);
                    }

                    var blobClient = storageService.GetBlob("userimages", uniqueFileName);
                    using (var fileStream = System.IO.File.OpenRead(pathToSave))
                    {
                        await blobClient.UploadAsync(fileStream, true);
                    }

                    if (System.IO.File.Exists(pathToSave))
                    {
                        System.IO.File.Delete(pathToSave);
                    }

                var userEntity = _mapper.Map<User>(userDto);
                userEntity.imageBlobLink = uniqueFileName;
                var result = table.AddEntity<User>(userEntity);
                if (result.IsError)
                {
                    return BadRequest();
                }

                return Ok(new { token = jwt.GenerateToken(userDto.username) });
            }
            return BadRequest();
        }

        [HttpGet]
        [Route("google-register")]
        public IActionResult GoogleRegister()
        {
            var redirectUrl = Url.Action("GoogleResponse");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet]
        [Route("google-response")]
        public IActionResult GoogleResponse()
        {
            var redirectUrl = "http://localhost:3000/google-callback?token=";

            var result = HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme).Result;
            if (!result.Succeeded)
            {
                return BadRequest("Google authentication failed.");
            }

            var accessToken = result.Properties.GetTokenValue("access_token");

            // Request user info from Google
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var response = httpClient.GetStringAsync("https://www.googleapis.com/oauth2/v2/userinfo").Result;
            var userInfo = JsonDocument.Parse(response).RootElement;

            var imagelink = userInfo.GetProperty("picture").GetString();

            var claims = result.Principal.Identities.FirstOrDefault()?.Claims.Select(claim => new
            {
                claim.Issuer,
                claim.OriginalIssuer,
                claim.Type,
                claim.Value,
            });

            var email = result.Principal.FindFirstValue(ClaimTypes.Email);
            var firstname = result.Principal.FindFirstValue(ClaimTypes.Name);
            var lastname = result.Principal.FindFirstValue(ClaimTypes.Surname);
            var address = result.Principal.FindFirstValue(ClaimTypes.StreetAddress);
            var birthdate = result.Principal.FindFirstValue(ClaimTypes.DateOfBirth);
            //var imagelink = result.Principal.Identities.FirstOrDefault()?.Claims.FirstOrDefault(c => c.Type == "urn:google:image")?.Value;
            var username = email;
            DateTime birthdateActual;

            var table = storageService.GetTable("Users");
            var result1 = table.GetEntityIfExists<User>(username, username);
            if (result1.HasValue) { return Redirect(redirectUrl + jwt.GenerateToken(username)); }

            string uniqueFileName = null;
            if (!string.IsNullOrEmpty(imagelink))
            {
                using (var httpClient2 = new HttpClient())
                {
                    var imageBytes = httpClient2.GetByteArrayAsync(imagelink).Result;
                    uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imagelink);

                    var blobClient = storageService.GetBlob("userimages", uniqueFileName);
                    using (var stream = new MemoryStream(imageBytes))
                    {
                        blobClient.UploadAsync(stream, true).Wait();
                    }
                }
            }

            var userDto = new UserDTO { email = email, firstname = firstname, lastname = lastname, address = address, birthdate = DateTime.TryParse(birthdate, out birthdateActual) ? birthdateActual : DateTime.Now, username = username, password = Guid.NewGuid().ToString(), usertype = UserType.User };
            var userEntity = _mapper.Map<User>(userDto);
            userEntity.imageBlobLink = uniqueFileName;
            var result2 = table.AddEntity<User>(userEntity);
            if (result2.IsError)
            {
                return BadRequest();
            }
            return Redirect(redirectUrl + jwt.GenerateToken(username));
        }

        [HttpGet]
        [Authorize]
        [Route("get-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            var username = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;

            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Invalid token.");
            }

            var table = storageService.GetTable("Users");
            var result = table.GetEntityIfExists<User>(username, username);

            if (!result.HasValue)
            {
                return NotFound("User not found.");
            }

            var userEntity = result.Value;
            var userDto = _mapper.Map<UserDTO>(userEntity);
            if(userEntity.imageBlobLink != null)
            {
                var blobClient = storageService.GetBlob("userimages", userEntity.imageBlobLink);
                var imageStream = await blobClient.OpenReadAsync();

                using (var memoryStream = new MemoryStream())
                {
                    await imageStream.CopyToAsync(memoryStream);
                    userDto.image = new FormFile(memoryStream, 0, memoryStream.Length, userEntity.imageBlobLink, userEntity.imageBlobLink);
                }
            }

            return Ok(userDto);
        }
    }
}
