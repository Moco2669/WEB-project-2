using Common.DTO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace Web1.Controllers
{
    public class WebSocketHandler
    {
        private static Dictionary<string, WebSocket> connectedClients = new Dictionary<string, WebSocket>();

        private readonly IConfiguration _configuration;

        public WebSocketHandler(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task HandleWebSocketAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                var token = context.Request.Query["token"].ToString();

                if (string.IsNullOrEmpty(token))
                {
                    context.Response.StatusCode = 401; // Unauthorized
                    return;
                }
                /*
                var socket = await context.WebSockets.AcceptWebSocketAsync();
                var userId = context.User.FindFirst(ClaimTypes.Sid)?.Value;

                if (!string.IsNullOrEmpty(userId))
                {
                    connectedClients[userId] = socket;
                }*/
                try
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                    var validationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = _configuration["Jwt:Issuer"],
                        ValidAudience = _configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]))
                    };

                    var principal = tokenHandler.ValidateToken(token, validationParameters, out _);

                    var userId = principal.FindFirst(ClaimTypes.Sid)?.Value;

                    if (!string.IsNullOrEmpty(userId))
                    {
                        var socket = await context.WebSockets.AcceptWebSocketAsync();
                        connectedClients[userId] = socket;

                        await ListenToWebSocket(socket);
                    }
                    else
                    {
                        context.Response.StatusCode = 401;
                    }
                }
                catch (Exception ex)
                {
                    context.Response.StatusCode = 401;
                }
            }
        }

        public static async Task NotifyUserAsync(string userId, RideDTO ride)
        {
            if (connectedClients.ContainsKey(userId))
            {
                var socket = connectedClients[userId];
                var jsonMessage = JsonSerializer.Serialize(ride);
                var buffer = Encoding.UTF8.GetBytes(jsonMessage);
                await socket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        private static async Task ListenToWebSocket(WebSocket socket)
        {
            var buffer = new byte[1024 * 4];
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            while (!result.CloseStatus.HasValue)
            {
                result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            await socket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
    }
}
