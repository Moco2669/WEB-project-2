using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class RideDTO
    {
        private DateTime startDateTime;
        private TimeSpan driverArriveTime;
        private TimeSpan travelTime;
        private DateTime endDateTime;

        public string user { get; set; }
        public string driver { get; set; }
        public string startaddress { get; set; }
        public string destaddress { get; set; }
        public string id { get; set; }
        public double price { get; set; }
        public double distance { get; set; }
        public DateTime starttime { get { return startDateTime; } set { startDateTime = DateTime.SpecifyKind(value, DateTimeKind.Utc); } }
        public TimeSpan driverarrivetime { get { return driverArriveTime; } set { driverArriveTime = value; } }
        public TimeSpan traveltime { get { return travelTime; } set { travelTime = value; } }
        public DateTime arrivetime { get { return endDateTime; } set { endDateTime = DateTime.SpecifyKind(value, DateTimeKind.Utc); } }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public RideStatus status { get; set; }
        public int rating { get; set; }
    }

    public enum RideStatus { Estimated, Waiting, InProgress, Done }
}
