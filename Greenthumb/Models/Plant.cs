
namespace Greenthumb.Models
{
    public class Plant
    {
        public int PlantID { get; set; }
        public int UserID { get; set; }

        public int CareID { get; set; }
        public string Location { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; }

        public DisplayFormat User { get; set; }

        public Care Care { get; set; }
    }
}
