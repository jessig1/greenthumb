using System;
using System.Collections.Generic;

namespace Greenthumb.Models
{
    public class User
    {
        public int ID { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public DateTime SignupDate { get; set; }

        public ICollection<Plant> Plants { get; set; }
    }
}
