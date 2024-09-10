using Common.DTO;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common
{
    public interface IRideService : IService
    {
        public Task<RideDTO> EstimateRide(RideDTO dto);
        public Task<RideDTO> ConfirmRide(string user);
        public Task<RideDTO> AcceptRIde(string user, string driver);
        public Task<List<RideDTO>> GetWaitingRides();
    }
}
