using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Web1.JWT
{
    public class JWTOptionsSetup : IConfigureOptions<JWTOptions>
    {
        private const string SectionName = "Jwt";
        private readonly IConfiguration _configuration;

        public JWTOptionsSetup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void Configure(JWTOptions options)
        {
            _configuration.GetSection(SectionName).Bind(options);
        }
    }
}
