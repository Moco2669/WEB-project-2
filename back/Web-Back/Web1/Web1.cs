using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Web1.JWT;
using AutoMapper;
using Common.AutoMapper;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Web1
{
    /// <summary>
    /// The FabricRuntime creates an instance of this class for each service type instance.
    /// </summary>
    internal sealed class Web1 : StatelessService
    {
        public Web1(StatelessServiceContext context)
            : base(context)
        { }

        /// <summary>
        /// Optional override to create listeners (like tcp, http) for this service instance.
        /// </summary>
        /// <returns>The collection of listeners.</returns>
        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new ServiceInstanceListener[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
                    {
                        ServiceEventSource.Current.ServiceMessage(serviceContext, $"Starting Kestrel on {url}");

                        var builder = WebApplication.CreateBuilder();

                        builder.Services.AddCors(options =>
                            {
                                options.AddPolicy("AllowLocalhost",
                                    builder =>
                                    {
                                        builder.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
                                    });
                            });
                        builder.Services.AddSingleton(provider => new MapperConfiguration(cfg =>
                        {
                            cfg.AddProfile(new UserProfile());
                        }).CreateMapper());
                        builder.Services.AddSingleton<StatelessServiceContext>(serviceContext);
                        builder.Services.AddScoped<JWT.JWT>();
                        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
                        builder.Services.AddAuthentication(options =>
                        {
                            options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                            options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                            options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
                        }).AddCookie().AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
                        {
                            options.ClientId = builder.Configuration.GetSection("GoogleKeys:ClientId").Value;
                            options.ClientSecret = builder.Configuration.GetSection("GoogleKeys:ClientSecret").Value;
                            options.Scope.Add("profile");
                            options.Scope.Add("email");
                            options.SaveTokens = true;
                        });
                        builder.Services.ConfigureOptions<JWTOptionsSetup>();
                        builder.Services.ConfigureOptions<JWTBearerOptionsSetup>();
                        builder.WebHost
                                    .UseKestrel()
                                    .UseContentRoot(Directory.GetCurrentDirectory())
                                    .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                                    .UseUrls(url);
                        builder.Services.AddControllers();
                        var app = builder.Build();
                        app.UseCors("AllowLocalhost");
                        app.UseAuthentication();
                        app.UseAuthorization();
                        app.MapControllers();
                        
                        return app;

                    }))
            };
        }
    }
}
