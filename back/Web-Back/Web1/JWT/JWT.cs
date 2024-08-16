using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Web1.JWT
{
    public class JWT
    {
        private readonly JWTOptions _options;

        public JWT(IOptions<JWTOptions> options)
        {
            _options = options.Value;
        }

        public string GenerateToken(string username)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_options.SecretKey);

            var claims = new Claim[]
            {
                new Claim(ClaimTypes.Sid, username),
            };
            var signingCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(_options.Issuer, _options.Audience, claims, null, DateTime.UtcNow.AddHours(8), signingCredentials);

            string tokenValue = tokenHandler.WriteToken(token);
            return tokenValue;
        }
    }
}
