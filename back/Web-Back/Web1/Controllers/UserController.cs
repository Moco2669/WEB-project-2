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
            // save to table
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

        [HttpPost]
        [Route("register2")]
        public async Task<IActionResult> Register2([FromForm] UserDTO userDTO)
        {
            return Ok();
        }

        [HttpGet]
        [Route("google-register")]
        public IActionResult GoogleRegister()
        {
            var redirectUrl = Url.Action("GoogleResponse", "taxi/user");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet]
        public async Task<IActionResult> GoogleResponse()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
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
            var imagelink = result.Principal.Identities.FirstOrDefault()?.Claims.FirstOrDefault(c => c.Type == "urn:google:image")?.Value;
            var username = email;
            DateTime birthdateActual;

            var table = storageService.GetTable("Users");
            var result1 = table.GetEntityIfExists<User>(username, username);
            if (result1.HasValue) { return Ok(new { token = jwt.GenerateToken(username) }); }
            var userDto = new UserDTO { email = email, firstname = firstname, lastname = lastname, address = address, birthdate = DateTime.TryParse(birthdate, out birthdateActual) ? birthdateActual : DateTime.Now, username = username, password = Guid.NewGuid().ToString(), usertype = UserType.User };
            var userEntity = _mapper.Map<User>(userDto);
            var result2 = table.AddEntity<User>(userEntity);
            if (result2.IsError)
            {
                return BadRequest();
            }
            return Ok(new { token = jwt.GenerateToken(username) });
        }
    }
}
