using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class UserDTO3
    {
        private DateTime BIRTHDATE;
        public string email { get; set; }
        public string password { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public DateTime birthdate { get { return BIRTHDATE; } set { BIRTHDATE = DateTime.SpecifyKind(value, DateTimeKind.Utc); } }
        public string address { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserType? usertype { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public VerifyStatus? verifystatus { get; set; }
        public IFormFile image { get; set; }
        public byte[]? imagebytearray { get; set; }
        public string? imagebase64 { get; set; }
    }
}
