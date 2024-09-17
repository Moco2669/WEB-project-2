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
        public Task<RideDTO> AcceptRide(string user, string driver);
        public Task<List<RideDTO>> GetWaitingRides();
        public Task<List<RideDTO>> GetPreviousRides(string user);
        public Task<List<RideDTO>> GetDriversRides(string driver);
        public Task<List<RideDTO>> GetAllRides();
        public Task<RideDTO> GetRide(string username);
        public Task<RideDTO> GetDriversRide(string driver);
        public Task<bool> RateRide(string user,  int rating);
    }
}
