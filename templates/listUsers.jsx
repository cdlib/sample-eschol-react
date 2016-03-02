
// Page content for the "List Users" page
class UsersPage extends React.Component
{
  constructor() {
    super()
    var init = subuInitialData;
    this.state = { filter: "", pageSize: 10, pageNum: 1, total: init.total, users: init.users }
  }
  render() { return(
    <div className="container">
      <Header />
      <h1>List of Users</h1>
      <Filter onChange={(text) => this.getUsers(this.changeState({filter:text, pageNum:1}))} />
      <UserTable total={this.state.total} users={this.state.users} />
      <PagingWidget total={this.state.total} pageSize={this.state.pageSize} pageNum={this.state.pageNum} 
                    onChange={(n) => this.getUsers(this.changeState({pageNum:n}))}/>
      <Footer/>
    </div>
  )}
  getUsers(state) {
    $.getJSON("/api/listUsers", 
      { filter: state.filter, pageSize: state.pageSize, pageNum: state.pageNum }, 
      (data) => { this.changeState(data) });
  }
}

// Table of users
class UserTable extends React.Component 
{
  createRow(user) { return(
    <tr key={user.email}>
      <td><a href={"editUser/" + user.user_id}>{user.email}</a></td>
      <td>{user.first_name}</td>
      <td>{user.last_name}</td>
    </tr>
  )}
  render() { return(
    <div id="UsersTable">
      <p>Total: {this.props.total} </p>
      <table className="table table-striped table-sm">
        <thead className="thead-inverse">
          <th>Email</th>
          <th>First Name</th>
          <th>Last Name</th>
        </thead>
        <tbody>
          { this.props.users.map(this.createRow) }
        </tbody>
      </table>
    </div>
  )}
};

// Render everything under the single top-level div created in the base HTML
React.render(<UsersPage/>, document.getElementById('uiBase'));
