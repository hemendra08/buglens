FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["BugLens.Api.csproj", "./"]
RUN dotnet restore "BugLens.Api.csproj"
COPY . .
RUN dotnet publish "BugLens.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "BugLens.Api.dll"]
