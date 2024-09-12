using AutoMapper;
using Common;
using Common.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Client;
using System;
using System.Security.Claims;

namespace Web1.Controllers
{
    [Route("taxi/[controller]")]
    [ApiController]
    public class RideController : ControllerBase
    {
        private readonly JWT.JWT jwt;
        private readonly IMapper _mapper;
        private readonly IUserStorageService userStorageProxy;
        private readonly IRideService rideServiceProxy;

        public RideController(IMapper mapper, JWT.JWT jwt)
        {
            this.jwt = jwt;
            Uri storageUri = new Uri("fabric:/Web-Back/UserStorageService");
            Uri rideUri = new Uri("fabric:/Web-Back/RideService");
            userStorageProxy = ServiceProxy.Create<IUserStorageService>(storageUri);
            rideServiceProxy = ServiceProxy.Create<IRideService>(rideUri, new ServicePartitionKey(0), Microsoft.ServiceFabric.Services.Communication.Client.TargetReplicaSelector.PrimaryReplica);
            _mapper = mapper;
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        [Route("estimate")]
        public async Task<IActionResult> EstimateRide(RideRequest ride)
        {
            var username = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Invalid token.");
            }
            RideDTO currentRide= new RideDTO() { user = username, startaddress = ride.startaddress, destaddress = ride.destaddress };
            var rideEstimate = await rideServiceProxy.EstimateRide(currentRide);
            return Ok(rideEstimate);
        }

        [HttpGet]
        [Authorize(Roles = "User")]
        [Route("confirm")]
        public async Task<IActionResult> ConfirmRide()
        {
            var username = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized("Invalid token.");
            }
            var confirmedRide = await rideServiceProxy.ConfirmRide(username);
            return Ok(confirmedRide);
        }

        [HttpPost]
        [Authorize(Roles = "Driver")]
        [Route("accept")]
        public async Task<IActionResult> AcceptRide(AcceptRideRequest ride)
        {
            var drivername = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(drivername))
            {
                return Unauthorized("Invalid token.");
            }
            var acceptedRide = await rideServiceProxy.AcceptRide(ride.user, drivername);
            await WebSocketHandler.NotifyUserAsync(ride.user, acceptedRide);
            return Ok(acceptedRide);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Driver")]
        [Route("get-waiting")]
        public async Task<IActionResult> GetWaitingRides()
        {
            var drivername = HttpContext.User.FindFirst(ClaimTypes.Sid)?.Value;
            if (string.IsNullOrEmpty(drivername))
            {
                return Unauthorized("Invalid token.");
            }
            List<RideDTO> waitingRides = await rideServiceProxy.GetWaitingRides();
            return Ok(waitingRides);
        }

        public class RideRequest
        {
            public string startaddress { get; set; }
            public string destaddress { get; set; }
        }
        public class AcceptRideRequest
        {
            public string user { get; set; }
        }
    }
}
