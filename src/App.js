import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './css/App.css';
import './css/shards.min.css';
import './css/dark.min.css'; //water.css
//import './css/bootstrap.css';
import axios from 'axios';

// Checks if the albums array has anything in it. If not, it displays some text. If so, the albums are listed
// TODO: Make a blank phrase to show when loaded for the first time.
function IsAlbums(props){
  const len = props.albums.length;
  const albums = props.albums;
  const error = props.error;

  if (error.includes("Error") && len == 0){
    console.log(error);
    return <label>{error}</label>
  }
  if (len == 0){
    return <label>Nothing to see here!</label>
  }
  
  else{
    return(
      <ul>
        {albums.map(item => (
          <li key={item['title']}>
            <a target="_blank" rel="noopener noreferrer" href={item['url']}>{item['rank']+' '+item['title']}</a>
          </li>
        ))}
      </ul>
    ) 
  }
}

class Fields extends React.Component{
  constructor(props){
      super(props);
      this.state = {
          name: '', 
          period: 'overall',
          limit: 10,
          albums: [{title: "yet, try submitting something", rank: "Nothing"}],
          error: ''
      };

      this.handleChangeSelect = this.handleChangeSelect.bind(this);
      this.handleChangeInput = this.handleChangeInput.bind(this);
      this.handleChangeLimit = this.handleChangeLimit.bind(this);
      this.handlePost = this.handlePost.bind(this);
      this.errorOccur = this.errorOccur.bind(this);
  }

  // Sets the state for the username field
  handleChangeInput(event) {
      this.setState({name: event.target.value});
  }

    // Sets the state for the period selector
  handleChangeLimit(event) {
      this.setState({limit: event.target.value});
  }

  // Sets the state for the period selector
  handleChangeSelect(event) {
      this.setState({period: event.target.value});
  }

  // Sets the state for the album list
  handleChangeAlbums(data) {
    this.setState({albums: this.state.albums.concat(data)});
    
    //this.setState({urls: this.state.urls.concat(url)});
  }

  resetAlbums() {
    this.setState({albums: []});
  }

  errorOccur(err){
    this.setState({error: err});
  }

  // TODO: Use musicbrainz to see if a given album has art in musicbrainz, and display along with album link
  // If yes:
  //  link to it for download

  handlePost(event){
    // Check if username exists at http://www.last.fm/user/NAME
    this.resetAlbums();
    const { name, period, limit } = this.state;
    axios
      .post('https://silver-glass.herokuapp.com/query', { name, period, limit }) //tmp change. try and revert to just '/query' https://art-advisor.herokuapp.com
      .then(res => {
        if (!res.data.hasOwnProperty('name')){
          console.log(res);
          var albumList = res.data.topalbums.album;

          albumList.forEach(element => {
            var rank = element['@attr']['rank']+":";
            var title = element['name'];
            var img = element['image'][0]['#text'];
            var url = element['url'];
            
            // If there is no image...
            if (img == ""){
              this.handleChangeAlbums({title: title, url: url, rank: rank});
            }
          });
          console.log(this.state.albums);
        }
        // Error handling
        else{
          this.errorOccur(res.data.name+": "+res.data.message)
        }

      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
      return(
        <div>
          
          <form className="center">
          <h1>Art</h1>
              <fieldset>
                <legend>Input</legend>
                <label>Username:</label>
                <br/>
                <input required type="text" onChange={this.handleChangeInput} id="username" placeholder="Last.FM username"></input>

                <label>Limit:</label>
                <br/>

                <select value={this.state.limit} onChange={this.handleChangeLimit}>
                    <option value='10'>10</option>
                    <option value='20'>20</option>
                    <option value='30'>30</option>
                    <option value='40'>40</option>
                    <option value='50'>50</option>
                    <option value='100'>100</option>
                </select>

                <label>Period:</label>
                <br/>

                <select value={this.state.period} onChange={this.handleChangeSelect}>
                    <option value='overall'>Overall</option>
                    <option value='7day'>7 Days</option>
                    <option value='1month'>1 Month</option>
                    <option value='3month'>3 Months</option>
                    <option value='6month'>6 Months</option>
                    <option value='12month'>12 Months</option>
                </select>
                <button type="button" onClick={this.handlePost}>Submit</button>
              </fieldset>
              <div>
                <p>------------------------------------------------------------------------------------------------------------------------------</p>
                <IsAlbums albums={this.state.albums} error={this.state.error}/>
                <p>------------------------------------------------------------------------------------------------------------------------------</p>
            </div>
          </form>
          
          
        </div>
          
          
      );
  }
}

// ========================================

ReactDOM.render(
<Fields />,

document.getElementById('root')
);

export default Fields;
