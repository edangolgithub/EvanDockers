public class SeedData
{
    public static void Initialize(ApplicationDbContext context)
    {
        if (!context.WeatherForecasts.Any())
        {
            var summaries = new[]
            {
                "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
            };

            var initialData = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
                .ToArray();
            context.WeatherForecasts.AddRange(initialData);
            context.SaveChanges();
        }
    }
}
