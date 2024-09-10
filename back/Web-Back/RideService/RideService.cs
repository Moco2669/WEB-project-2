using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Common;
using Common.DTO;
using Common.Model;
using System.Runtime.CompilerServices;
using Microsoft.ServiceFabric.Services.Remoting;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.V2.FabricTransport.Runtime;

namespace RideService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class RideService : StatefulService, IRideService
    {
        IReliableDictionary<string, RideDTO> userRides;
        IReliableDictionary<string, RideDTO> driverRides;
        public RideService(StatefulServiceContext context)
            : base(context)
        {
        }

        private async Task<RideStatus> GetStatus(string user)
        {
            RideDTO ride = null;
            using (var tx = this.StateManager.CreateTransaction())
            {
                var result = await userRides.TryGetValueAsync(tx, user);
                if (!result.HasValue) { return RideStatus.Estimated; }
                ride = result.Value;
            }
            return ride.status;
        }

        private async Task<RideDTO> GetRide(string user)
        {
            RideDTO ride = null;
            using (var tx = this.StateManager.CreateTransaction())
            {
                var result = await userRides.TryGetValueAsync(tx, user);
                if(!result.HasValue) { throw new InvalidOperationException("Ride doesn't exist"); }
                ride = result.Value;
            }
            return ride;
        }

        private async Task<List<RideDTO>> GetWaiting()
        {
            List<RideDTO> waiting = new List<RideDTO>();
            using (var tx = this.StateManager.CreateTransaction())
            {
                var enumerable = await userRides.CreateEnumerableAsync(tx);
                var enumerator = enumerable.GetAsyncEnumerator();
                while (await enumerator.MoveNextAsync(default(CancellationToken)))
                {
                    var current = enumerator.Current;
                    if(current.Value.status == RideStatus.Waiting)
                    {
                        waiting.Add(current.Value);
                    }
                }
                await tx.CommitAsync();
            }
            return waiting;
        }

        private async Task AddOrUpdateRide(RideDTO dto)
        {
            using (var tx = this.StateManager.CreateTransaction())
            {
                await userRides.AddOrUpdateAsync(tx, dto.user, dto, (key, existingRide) => dto);
                await tx.CommitAsync();
            }
        }

        public async Task<RideDTO> EstimateRide(RideDTO dto)
        {
            try
            {
                if(await GetStatus(dto.user) != RideStatus.Estimated) { throw new InvalidOperationException("Ride is already waiting or in progress."); }

                Random random = new Random();
                dto.distance = (random.NextDouble() * (15-0.1)) + 0.1;
                double travelTimeVariance = dto.distance * (random.NextDouble() / 10); // 0 - 10% of the distance
                double travelTimeAdjustment = random.Next(-1, 1) == -1 ? -1 : 1;
                dto.traveltime = TimeSpan.FromSeconds((dto.distance + travelTimeVariance*travelTimeAdjustment));
                dto.price = dto.distance * 100; // 100din / km
                dto.price = dto.price + (random.Next(-1, 1) == -1 ? -1 : 1) * ((dto.price / 10) * random.NextDouble()); // variance

                await AddOrUpdateRide(dto);

                return dto;
            } catch(Exception ex)
            {
                throw new InvalidOperationException("Error when estimating ride", ex);
            }
        }

        public async Task<RideDTO> ConfirmRide(string user)
        {
            try
            {
                RideDTO ride = await GetRide(user);
                if(ride.status != RideStatus.Estimated)
                {
                    throw new InvalidOperationException("Ride is already waiting or in proggress");
                }
                ride.status = RideStatus.Waiting;
                // ride.starttime = DateTime.Now; // Ride start time will be when it's accepted by driver

                await AddOrUpdateRide(ride);
                return ride;
            }
            catch(Exception ex)
            {
                throw new InvalidOperationException("Error when confirming ride", ex);
            }
        }

        public async Task<RideDTO> AcceptRide(string user, string driver)
        {
            try
            {
                RideDTO ride = await GetRide(user);
                if (ride.status != RideStatus.Waiting)
                {
                    throw new InvalidOperationException("Ride is not confirmed or is in proggress");
                }
                ride.status = RideStatus.InProgress;

                Random random = new Random();
                ride.driver = driver;
                ride.driverarrivetime = TimeSpan.FromSeconds((random.NextDouble() * (15 - 0.1)) + 0.1);
                ride.starttime = DateTime.Now;

                await AddOrUpdateRide(ride);
                return ride;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when accepting ride", ex);
            }
        }

        public async Task<List<RideDTO>> GetWaitingRides()
        {
            try
            {
                return await GetWaiting();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error when getting waiting rides", ex);
            }
        }

        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }

        /// <summary>
        /// This is the main entry point for your service replica.
        /// This method executes when this replica of your service becomes primary and has write status.
        /// </summary>
        /// <param name="cancellationToken">Canceled when Service Fabric needs to shut down this service replica.</param>
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

            var myDictionary = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, long>>("myDictionary");
            userRides = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, RideDTO>>("userRides");
            driverRides = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, RideDTO>>("driverRides");

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                using (var tx = this.StateManager.CreateTransaction())
                {
                    var result = await myDictionary.TryGetValueAsync(tx, "Counter");

                    ServiceEventSource.Current.ServiceMessage(this.Context, "Current Counter Value: {0}",
                        result.HasValue ? result.Value.ToString() : "Value does not exist.");

                    await myDictionary.AddOrUpdateAsync(tx, "Counter", 0, (key, value) => ++value);

                    // If an exception is thrown before calling CommitAsync, the transaction aborts, all changes are 
                    // discarded, and nothing is saved to the secondary replicas.
                    await tx.CommitAsync();
                }

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
