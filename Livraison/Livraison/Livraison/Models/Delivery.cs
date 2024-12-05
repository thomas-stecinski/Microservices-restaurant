namespace Livraison.Models
{
    public class Delivery
    {
 
        public string Id { get; set; }
        public string IdComande { get; set; }
        public string IdClient { get; set; }
        public string IdLivreur { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string Status { get; set; }
        public string Prix { get; set; }
        public DateTime DateLivraison { get; set; }


    }

}
