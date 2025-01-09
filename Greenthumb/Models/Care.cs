using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;   

namespace Greenthumb.Models
{
    public class Care
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int CareID { get; set; }
        public string Watering { get; set; }
        public string Light { get; set; }   
        public string Soil { get; set; }
       

        public ICollection<Plant> Plants { get; set; }

    }
}
