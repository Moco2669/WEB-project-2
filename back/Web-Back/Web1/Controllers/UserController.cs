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
using Microsoft.ServiceFabric.Services.Remoting.Client;
using System.Text;
using System.Security.Cryptography;
using SendGrid;
using System.Net;
using SendGrid.Helpers.Mail;
using Microsoft.ServiceFabric.Services.Client;

namespace Web1.Controllers
{
    [Route("taxi/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly JWT.JWT jwt;
        private readonly IMapper _mapper;
        private readonly IUserStorageService userStorageProxy;
        private readonly IRideService driverStorageProxy;
        private readonly string emailKey;

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }
        }

        private byte[] ConvertIFormFileToByteArray(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            using (var memoryStream = new MemoryStream())
            {
                file.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }

        public UserController(IMapper mapper, JWT.JWT jwt, IConfiguration configuration)
        {
            this.jwt = jwt;
            Uri serviceUri = new Uri("fabric:/Web-Back/UserStorageService");
            Uri rideUri = new Uri("fabric:/Web-Back/RideService");
            userStorageProxy = ServiceProxy.Create<IUserStorageService>(serviceUri);
            driverStorageProxy = ServiceProxy.Create<IRideService>(rideUri, new ServicePartitionKey(0), Microsoft.ServiceFabric.Services.Communication.Client.TargetReplicaSelector.PrimaryReplica);
            _mapper = mapper;
            emailKey = configuration["EmailKey"];
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginModel)
        {
            var user = await userStorageProxy.GetUser(loginModel.username);
            if (user == null) { return NotFound(); }
            if (user.password == HashPassword(loginModel.password)) { return Ok(new { token = jwt.GenerateToken(loginModel.username, user.usertype) }); };
            return NotFound();
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromForm] UserDTO userDto)
        {
            // check if exists
            var user = await userStorageProxy.GetUser(userDto.username);
            if (user != null) { return NotFound(); }

            string imageBlobLink = null;

            if (userDto.image == null) { return BadRequest(); }
            userDto.imagebytearray = ConvertIFormFileToByteArray(userDto.image);
            var imagename = userDto.image.FileName;
            userDto.image = null;
            imageBlobLink = await userStorageProxy.InsertUserImage(userDto.imagebytearray, imagename);
            if (userDto.usertype == UserType.Driver)
            {
                var result = await userStorageProxy.InsertDriver(userDto, imageBlobLink);
                if (!result) { return BadRequest(); }
                return Ok(new { token = jwt.GenerateToken(userDto.username, userDto.usertype) });
            }

            // if not driver insert into regular table
            var result1 = await userStorageProxy.InsertUser(userDto, imageBlobLink);
            if (!result1) { return BadRequest(); }
            return Ok(new { token = jwt.GenerateToken(userDto.username, userDto.usertype) });
        }

        [HttpPost]
        [Authorize]
        [Route("edit")]
        public async Task<IActionResult> EditProfile([FromForm] UserDTO3 userDTO)
        {
            var username = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Invalid token.");
            }
            var imageBlobLink = "";
            userDTO.password = HashPassword(userDTO.password);
            if(userDTO.image == null)
            {
                var result = await userStorageProxy.UpdateUser(userDTO, username);
                if(!result) { return BadRequest(); }
                return Ok();
            }
            else
            {
                userDTO.imagebytearray = ConvertIFormFileToByteArray(userDTO.image);
                var imagename = userDTO.image.FileName;
                userDTO.image = null;
                imageBlobLink = await userStorageProxy.InsertUserImage(userDTO.imagebytearray, imagename);
                var result = await userStorageProxy.UpdateUserAndImage(userDTO, imageBlobLink, username);
                if (!result) { return BadRequest(); }
                return Ok();
            }
        }

        [HttpPost]
        [Route("register-google")]
        public async Task<IActionResult> GoogleRegister([FromForm]UserDTO userDto)
        {
            var result1 = await userStorageProxy.GetUser(userDto.username);
            if (result1 != null) { return Ok(new { token = jwt.GenerateToken(userDto.username, result1.usertype) }); }

            if (userDto.image != null)
            {
                userDto.imagebytearray = ConvertIFormFileToByteArray(userDto.image);
                var imagename = userDto.image.FileName;
                userDto.image = null;
                var imageBlobLink = await userStorageProxy.InsertUserImage(userDto.imagebytearray, imagename);
                var result = await userStorageProxy.InsertUser(userDto, imageBlobLink);
                if (!result)
                {
                    return BadRequest();
                }
                //missing cleanup of imageblob but we're not paid for security :D
                return Ok(new { token = jwt.GenerateToken(userDto.username, userDto.usertype) });
            }
            return BadRequest();
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

            var userDto = await userStorageProxy.GetUser(username);
            if (userDto == null) { return NotFound(); }

            return Ok(userDto);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [Route("get-waiting-users")]
        public async Task<IActionResult> GetWaitingUsers()
        {
            var username = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Invalid token.");
            }

            List<UserDTO> drivers = await userStorageProxy.GetAllDrivers();
            List<UserDTO2> driversWithRatings = new();
            foreach(var driver in drivers)
            {
                UserDTO2 driverWithAvg = new(driver);
                //UserDTO2 driverWithAvg = (UserDTO2)driver;
                var driversRides = await driverStorageProxy.GetDriversRides(driver.username);
                if (driversRides.Count > 0)
                {
                    double sum = 0;
                    foreach(RideDTO ride in driversRides)
                    {
                        sum += ride.rating;
                    }
                    double avg = sum / driversRides.Count;
                    driverWithAvg.avgRating = avg;
                }
                else
                {
                    driverWithAvg.avgRating = 0;
                }
                driversWithRatings.Add(driverWithAvg);
            }
            return Ok(driversWithRatings);
        }

        /*[HttpPut]
        [Authorize(Roles = "Admin")]
        [Route("validate-user/{username}")]
        public async Task<IActionResult> ValidateUser(string username)
        {
            var adminUsername = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return BadRequest();
            }
            var userDto = await userStorageProxy.GetUser(adminUsername);
            if (userDto.usertype != UserType.Admin)
            {
                return Unauthorized("User is not admin.");
            }

            var result = await userStorageProxy.ValidateUser(username);
            if (!result)
            {
                return BadRequest();
            }
            return Ok();
        }*/

        [HttpPut]
        [Route("validate-user-new")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ValidateUserNew(Request1 req)
        {
            var result = await userStorageProxy.ValidateUser(req.username);
            if (result == null) { return BadRequest(); }
            await SendEmail(result.email);
            return Ok();
        }

        [HttpPut]
        [Route("reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectUser(Request1 req)
        {
            var result = await userStorageProxy.RejectUser(req.username);
            if (!result) { return BadRequest(); }
            return Ok();
        }

        private async Task<bool> SendEmail(string email)
        {
            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            string api_key = emailKey;
            // string api_secret = "API_SECRET";
            var client = new SendGridClient(api_key);
            var fromEmail = new EmailAddress("ebdldv3@gmail.com", "RCA Projekat");
            var toEmail = new EmailAddress(email, email.Split('@')[0]);
            var text = "Your taxi driver account has been verified!";
            var msg = MailHelper.CreateSingleEmail(fromEmail, toEmail, "Verification notification", text, text);
            var response = await client.SendEmailAsync(msg);
            return response.IsSuccessStatusCode;
        }

        public class Request1
        {
            public string username { get; set; }
        }
    }
}
