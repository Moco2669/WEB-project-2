﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using System.Text.Json.Serialization;

namespace Common.DTO
{
    public class UserDTO
    {
        private DateTime BIRTHDATE;
        public string email { get; set; }
        public string password { get; set; }
        public string username { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public DateTime birthdate { get { return BIRTHDATE; } set { BIRTHDATE = DateTime.SpecifyKind(value, DateTimeKind.Utc); } }
        public string address { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public UserType usertype { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public VerifyStatus? verifystatus { get; set; }
        public IFormFile image { get; set; }
        public byte[]? imagebytearray { get; set; }
        public string? imagebase64 { get; set; }
    }

    public enum UserType { Admin, Driver, User }
    public enum VerifyStatus { Waiting, Verified, Rejected }

    /*public static IFormFile ConvertBase64ToIFormFile(string base64String, string fileName)
{
    var bytes = Convert.FromBase64String(base64String);
    var stream = new MemoryStream(bytes);
    var file = new FormFile(stream, 0, bytes.Length, fileName, fileName)
    {
        Headers = new HeaderDictionary(),
        ContentType = "image/jpeg"
    };

    return file;
}*/
}
