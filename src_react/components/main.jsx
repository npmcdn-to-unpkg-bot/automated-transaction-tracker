'use strict'

class Home_Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      active_page: 'Home Page',
      active_store: '',
      store_transactions: {},
      transaction_shown: {}
    };
    this.goTo = this.goTo.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    console.log(localStorage.getItem('_user_id'));
    var _user_id = localStorage.getItem('_user_id');

    var req = new XMLHttpRequest();
    let url = '/user/' + _user_id;
  
    console.log(url);

    req.open('GET', url);
    req.onreadystatechange = () => {
      if (req.readyState == 4) {
        var user = JSON.parse(req.responseText);
          this.state.user = user[0];
          this.setState({
            user: this.state.user
          });
          console.log(this.state.user);
      }
    }
    req.send();

    dispatcher.addEventListener('send_store_transactions', (store_trans) => {
        console.log(store_trans);
        //First, take out the "active store"
        var active_store = store_trans.active_store;
        delete store_trans.active_store;
        this.state.store_transactions = store_trans;
        this.state.active_store = active_store;
        // console.log(this.state.store_transactions);
        this.setState({
          active_store: this.state.active_store,
          store_transactions: this.state.store_transactions
        });
      });
      
      dispatcher.addEventListener('send_transaction_details',
        (transaction) => {
            this.state.transaction_shown = transaction;
            this.setState({
              transaction_shown: this.state.transaction_shown
            });
            // console.log('called');
            // console.log(this);
            // console.log(this.state.transaction_shown);
            //console.log(dispatcher.state.transaction_shown);
      });
      
      dispatcher.addEventListener('update_transaction', (action) => {
        var update = new XMLHttpRequest();
        // console.log(this.state.transaction_shown._id);
        let id = this.state.transaction_shown._id;
        // console.log(id);
        let url = '/store/' + this.state.active_store + '/trans/' +
        id + '/' + action;
        console.log(url);
        // /trans/_id/renew
        update.open('PUT', url);
        update.onreadystatechange = () => {
          if (update.readyState == 4){
            dispatcher.dispatchEvent('send_transaction_details', 
            JSON.parse(update.responseText))
            // Why do I even need to dispatch this event to be honest
            // I can mutate the state straight away from here. Ah well
            // I think it's cleaner to do this. DRY after all...
          };
        }
        update.send();
       });
  }

  goTo(page) {
    return (e) => {
       let active_page = page;
      console.log(active_page);
      this.setState({
        active_page: active_page
      })
    }
  }

  render() {
    return(
        <div>
        <header>{this.state.user.username} <button>Logout</button></header>
        <h1>{this.state.active_page}</h1>
        <button onClick={this.goTo('User_Management_Page')}>Edit user</button>
        <button onClick={this.goTo('Stores_Page')}>View stores</button>

        <Stores_Page active_page = {this.state.active_page}/>
          <Add_Store_Page 
            active_page = {this.state.active_page}
          />
          <Store_Management_Page 
            active_page = {this.state.active_page}
            active_store = {this.state.active_store}
          />
          <Transactions_View_Page 
            active_store={this.state.active_store}
            active_page={this.state.active_page}
            transactions={this.state.store_transactions}
          />
            <Add_Transaction_Page
              active_page = {this.state.active_page}
              active_store = {this.state.active_store}
            />
            <Transaction_View_Detail_Page
              active_page={this.state.active_page}
              transaction ={this.state.transaction_shown}
            />
        <User_Management_Page active_page = {this.state.active_page}/>
        </div>
        )
  }
}

var homePage = ReactDOM.render( <Home_Page/>, document.getElementById('content'));
