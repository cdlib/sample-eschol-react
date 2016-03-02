React.Component.prototype.changeState = function(stuff) {
  let newState = _.extend({}, this.state, stuff);
  this.setState(newState);
  return newState;
}

class Header extends React.Component 
{
  render() { return(
    <div className="header">
      <img src="/images/escholarship_small.png" alt="eScholarship logo" width="170" height="51"/>
      <hr />
    </div>
  )}
}

class Footer extends React.Component 
{
  render() { return(
    <div className="footer">
      <hr />
      <img alt="CDL logo" id="cdl_logo" src="/images/CDL_logo_footer.png" width="32" height="32" />
      <span>
        Powered by <a href="http://cdlib.org">California Digital Library</a>
      </span>
    </div>
  )}
}

// Page element to allow filtering a set of things (like users, units, etc.)
class Filter extends React.Component 
{
  constructor() {
    super();
    this.state = { text: "" };
    this.handleChange = _.debounce(this.handleChange, 300); // Only recognize change after it becomes stable
  }
  render() { return(
    <form className="filterForm" onSubmit={(e) => this.handleSubmit(e) }>
      <input type="text" placeholder="Filter" ref="text" onChange={(e) => this.handleChange(e) } />
    </form>
  )}
  handleSubmit(e) {
    e.preventDefault(); // suppress trying to "submit" the form
  }
  handleChange() {
    var text = React.findDOMNode(this.refs.text).value.trim();
    this.changeState({text: text});
    this.props.onChange(text);
  }
}

class PagingWidget extends React.Component
{
  render() { 
    var totalPages = Math.trunc((this.props.total + this.props.pageSize - 1) / this.props.pageSize);
    return(
      <div className="pagingWidget">
        <button type="button" className="btn btn-secondary" disabled={this.props.pageNum == 1}
                onClick={() => this.setPage(this.props.pageNum - 1)}>
          Prev
        </button>
        <span className="count">Page {this.props.pageNum} of {totalPages}</span>
        <button type="button" className="btn btn-secondary" disabled={this.props.pageNum >= totalPages}
                onClick={() => this.setPage(this.props.pageNum + 1)}>
          Next
        </button>
      </div>
    )
  }
  setPage(newPageNum) {
    this.props.onChange(newPageNum);
  }
}
