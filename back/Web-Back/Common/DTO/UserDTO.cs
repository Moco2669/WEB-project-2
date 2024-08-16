using Microsoft.AspNetCore.Http;

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
        public UserType usertype { get; set; }
        public IFormFile image { get; set; }
    }

    public enum UserType { Admin, Driver, User }
}
