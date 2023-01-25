#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:7.0 as base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["DockerSqlServer/DockerSqlServer.csproj", "DockerSqlServer/"]
RUN dotnet restore "DockerSqlServer/DockerSqlServer.csproj"
COPY . .
WORKDIR "/src/DockerSqlServer"
RUN dotnet build "DockerSqlServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DockerSqlServer.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DockerSqlServer.dll"]