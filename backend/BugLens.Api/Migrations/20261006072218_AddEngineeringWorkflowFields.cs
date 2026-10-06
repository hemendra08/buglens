using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BugLens.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEngineeringWorkflowFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BranchName",
                table: "Bugs",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Environment",
                table: "Bugs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PullRequestUrl",
                table: "Bugs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BranchName",
                table: "Bugs");

            migrationBuilder.DropColumn(
                name: "Environment",
                table: "Bugs");

            migrationBuilder.DropColumn(
                name: "PullRequestUrl",
                table: "Bugs");
        }
    }
}
