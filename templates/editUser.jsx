
// Page content for the single-"Edit Users" page
class UserPage extends React.Component
{
  constructor() {
    super();
    self.state = { user: subuInitialData };
    console.log("State: ", self.state);
  }
  render() { 
    var u = self.state.user;
    return(
    <div className="container">
      <Header />
      <h1>User Info</h1>
      <table className="table">
        <tbody>
          <tr>
            <td>Email</td>
            <td>{u.email}</td>
          </tr>
          <tr>
            <td>First name</td>
            <td>{u.first_name}</td>
          </tr>
          <tr>
            <td>Middle name</td>
            <td>{u.middle_name}</td>
          </tr>
          <tr>
            <td>Last name</td>
            <td>{u.last_name}</td>
          </tr>
        </tbody>
      </table>
      <Footer/>
    </div>
  )}
}

// Render everything under the single top-level div created in the base HTML
React.render(<UserPage/>, document.getElementById('uiBase'));
