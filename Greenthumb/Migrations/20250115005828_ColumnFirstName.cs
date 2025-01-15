using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Greenthumb.Migrations
{
    /// <inheritdoc />
    public partial class ColumnFirstName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FirstName",
                table: "User",
                newName: "First Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "First Name",
                table: "User",
                newName: "FirstName");
        }
    }
}
