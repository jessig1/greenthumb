using System;
using System.ComponentModel.DataAnnotations;

namespace Greenthumb.Models.GreenthumbViewModels
{
    public class EnrollmentDateGroup
    {
        [DataType(DataType.Date)]
        public DateTime? SignupDate { get; set; }

        public int UserCount { get; set; }

    }
}
