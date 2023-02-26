import * as React from "react";

class GuesserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.value);
    console.log(this.state.value);
    this.props.socket.emit("guess", this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="flex mt-4">
          <input
            className="block w-full flex-grow rounded-l-md"
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
          />
          <input
            className="bg-black text-white rounded-r-md text-small inline-block px-5 py-3 flex-none cursor-pointer"
            type="submit"
            value="Submit"
          />
        </div>
      </form>
    );
  }
}

export default GuesserForm;
