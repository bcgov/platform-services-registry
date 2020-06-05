import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { createSigningJob } from '../actionCreators';
import { authenticateFailed, authenticateSuccess } from '../actions';
import { Authentication, default as implicitAuthManager } from '../auth';
import './App.css';
import Header from './UI/Header';

interface MyState {
  authentication: Authentication;

}

interface MyProps { }

export class App extends React.Component<MyProps, MyState> {

  constructor(props: MyProps) {
    super(props);

    this.state = { authentication: { isAuthenticated: false } };
  }

  componentDidMount = () => {
    console.log('p =', this.props);
    implicitAuthManager.registerHooks({
      // @ts-ignore
      onAuthenticateSuccess: () => this.props.login(),
      // @ts-ignore
      onAuthenticateFail: () => this.props.logout(),
      // @ts-ignore
      // onAuthLocalStorageCleared: () => this.props.logout(),
    });
    // don't call function if on localhost
    if (!window.location.host.match(/localhost/)) {
      implicitAuthManager.handleOnPageLoad();
    }
  };

  render() {
    return (
      <div className="App">
        <Header authentication={this.state.authentication} />
      </div>
    );
  }
}

function mapStateToProps(state: MyState): MyState {
  console.log('state = ', state)
  return {
    authentication: state.authentication,
  };
}

function mapDispatchToProps(dispatch: any) {
  return bindActionCreators(
    {
      login: () => dispatch(authenticateSuccess()),
      logout: () => dispatch(authenticateFailed()),
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
