using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DTO
{
    public class UserDTO2 : UserDTO
    {
        public UserDTO2(UserDTO user)
        {
            this.firstname = user.firstname;
            this.address = user.address;
            this.lastname = user.lastname;
            this.email = user.email;
            this.password = user.password;
            this.username = user.username;
            this.usertype = user.usertype;
            this.verifystatus = user.verifystatus;
            this.birthdate = user.birthdate;
            this.imagebase64 = user.imagebase64;
            this.imagebytearray = user.imagebytearray;
        }
        public double avgRating { get; set; }
    }
}
