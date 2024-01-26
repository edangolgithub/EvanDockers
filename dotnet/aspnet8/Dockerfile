# Use the official ASP.NET Core image with .NET Core 8 as a base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Use the official .NET Core SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the .csproj files and restore dependencies
COPY *.csproj ./aspnet8/
RUN dotnet restore ./aspnet8/aspnet8.csproj

# Copy the rest of the application code and build the application
COPY . ./aspnet8/
WORKDIR /src/aspnet8
RUN dotnet build -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Final image with only the runtime files
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "aspnet8.dll"]
