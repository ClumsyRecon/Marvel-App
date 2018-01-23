import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import md5 from 'blueimp-md5'
import './index.css'
import './modal.css'

const myKey = "6edf4b1e61f0831298980192ff1a741c41e42039";
const apiKey = "f7a872975ce4847b4fc9e5a1fe8d1c0d";
const ts = new Date().getTime();
const hash = md5(ts+myKey+apiKey);
const limit = 30;
var searched = "A";

class SearchBar extends React.Component {
  searchChar(s, l) {
    if(s !== "") {
      if(l === "characters") {
        ReactDOM.render(
          <Characters ts={ts} apiKey={apiKey} hash={hash} searched={searched} />, document.getElementById('root')
        );
      } else if (l === "series") {
        ReactDOM.render(
          <Series ts={ts} apiKey={apiKey} hash={hash} searched={searched} />, document.getElementById('root')
        );
      }
    } else {
      ReactDOM.render(
        <div id="error">No results found</div>, document.getElementById('root')
      );
    }
  }
  handleSearch(e) {
    searched = document.getElementById('search').value;
    this.searchChar(searched, document.getElementById('input').value);
  }
  render() {
    return (
      <div>
        <select id="input" onChange={this.handleSearch.bind(this)}>
          <option value="characters">Characters</option>
          <option value="series">Series</option>
        </select>
        <input type="search" id="search" placeholder="Enter a Name or Title..."/>
        <input type="button" id="searchButton" value="Search" onClick={this.handleSearch.bind(this)}/>
      </div>
    );
  }
}

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
  }
  handleClose(e) {
    this.closeModal();
  }
  closeModal() {
    ReactDOM.render(
      <div></div>, document.getElementById('modal')
    );
  }
}

class CharacterModal extends Modal {
  render() {
    var descr = "";
    if (this.props.description === "" || this.props.description === null) {
      descr = this.props.name + " does not have a description available please check the Marvel Comics Wiki for more information.";
    } else {
      descr = this.props.description;
    }
    return (
      <div id="modal_container">
        <div id="overlay" onClick={this.handleClose}></div>
        <div id="modal_screen">
          <div id="closeModal" onClick={this.handleClose}>&#10006;</div>
          <div className="modal_info">
            <div id="modal_thumb">
              <img src={this.props.img} alt={this.props.name}/>
            </div>
            <div id="modal_content">
              <h2>{this.props.name}</h2>
              <p className="modal_descr">{descr}</p>
            </div>
            <div id="series_info">
              <h4>Series</h4>
            </div>
            <div id="character_series">
              <SeriesList charID={this.props.charID} ts={ts} apiKey={apiKey} hash={hash} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class SeriesModal extends Modal {
  render() {
    var descr = "";
    if (this.props.description === "" || this.props.description === null) {
      descr = this.props.title + " does not have a description available please check the Marvel Comics Wiki for more information.";
    } else {
      descr = this.props.description;
    }
    return (
      <div id="modal_container">
        <div id="overlay" onClick={this.handleClose}></div>
        <div id="modal_screen">
          <div id="closeModal" onClick={this.handleClose}>&#10006;</div>
          <div className="modal_info">
            <div id="modal_thumb">
              <img src={this.props.img} alt={this.props.title}/>
            </div>
            <div id="modal_content">
              <h2>{this.props.title.slice(0,this.props.title.indexOf('('))}</h2>
              <h3>{this.props.title.slice((this.props.title.indexOf('(')+1),this.props.title.indexOf(')'))}</h3>
              <p className="modal_descr">{descr}</p>
            </div>
            <div id="series_info">
              <h4>Characters</h4>
            </div>
            <div id="character_series">
              <CharacterList seriesID={this.props.seriesID} ts={ts} apiKey={apiKey} hash={hash} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Characters extends React.Component {
  constructor(props) {
    super(props);
    this.handleShow = this.handleShow.bind(this);
    this.state = {
      characters: []
    };
  }
  componentWillReceiveProps(nextProps) {
    this.getCharacters();
  }
  componentDidMount() {
    this.getCharacters();
  }
  getCharacters() {
    axios.get(`https://gateway.marvel.com:443/v1/public/characters?ts=${this.props.ts}&apikey=${this.props.apiKey}&hash=${this.props.hash}&nameStartsWith=${searched}&limit=${limit}`)
      .then(res => {
        const characters = res.data.data.results.map(obj => obj);
        this.setState({ characters });
      });
  }
  showModal(p) {
    ReactDOM.render(
      <CharacterModal charID={p.id} name={p.name} description={p.description} series={p.series} img={p.thumbnail.path + "/standard_fantastic." + p.thumbnail.extension}/>, document.getElementById('modal')
    );
  }
  handleShow(e) {
    this.showModal(e);
  }
  render() {
    return (
      <div id='comics'>
        {this.state.characters.map(character =>
          <div className='comic' key={character.id} onClick={(e) => this.handleShow(character)}>
            <img className='thumb' src={character.thumbnail.path + "/standard_fantastic." + character.thumbnail.extension} alt={character.name} />
            <h2 className="name">{character.name}</h2>
          </div>
        )}
      </div>
    );
  }
}

class Series extends React.Component {
  constructor(props) {
    super(props);
    this.handleShow = this.handleShow.bind(this);
    this.state = {
      series: []
    };
  }
  componentWillReceiveProps(nextProps) {
    this.getSeries();
  }
  componentDidMount() {
    this.getSeries();
  }
  getSeries() {
    axios.get(`https://gateway.marvel.com:443/v1/public/series?ts=${this.props.ts}&apikey=${this.props.apiKey}&hash=${this.props.hash}&titleStartsWith=${searched}&limit=${limit}`)
    .then(res => {
      const series = res.data.data.results.map(obj => obj);
      this.setState({ series });
    });
  }
  showModal(s) {
    ReactDOM.render(
      <SeriesModal seriesID={s.id} title={s.title} description={s.description} series={s.series} img={s.thumbnail.path + "/standard_fantastic." + s.thumbnail.extension}/>, document.getElementById('modal')
    );
  }
  handleShow(e) {
    this.showModal(e);
  }
  render() {
    return (
      <div id='comics'>
        {this.state.series.map(s =>
          <div className='comic' key={s.id} onClick={(e) => this.handleShow(s)}>
            <img className='thumb' src={s.thumbnail.path + "/standard_fantastic." + s.thumbnail.extension} alt={s.name} />
            <h2 className="name">{s.title}</h2>
          </div>
        )}
      </div>
    );
  }
}

class SeriesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: []
    };
  }
  componentDidMount() {
    axios.get(`https://gateway.marvel.com:443/v1/public/characters/${this.props.charID}/series?ts=${this.props.ts}&apikey=${this.props.apiKey}&hash=${this.props.hash}`)
      .then(res => {
        const series = res.data.data.results.map(obj => obj);
        this.setState({ series });
      });
  }
  showModal(s) {
    ReactDOM.render(
      <SeriesModal seriesID={s.id} title={s.title} description={s.description} characters={s.characters} img={s.thumbnail.path + "/standard_fantastic." + s.thumbnail.extension}/>, document.getElementById('modal')
    );
  }
  handleShow(e) {
    this.showModal(e);
  }
  render() {
    return (
      <div id="series_list">
        {this.state.series.map(series =>
          <div className="series" key={series.id} onClick={(e) => this.handleShow(series)}>
            <img className="series_thumb" src={series.thumbnail.path + "/portrait_fantastic." + series.thumbnail.extension} alt={series.title} />
            <h4 className="title">{series.title.slice(0,series.title.indexOf('('))}</h4>
          </div>
        )}
      </div>
    );
  }
}

class CharacterList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: []
    };
  }
  componentDidMount() {
    axios.get(`https://gateway.marvel.com:443/v1/public/series/${this.props.seriesID}/characters?ts=${this.props.ts}&apikey=${this.props.apiKey}&hash=${this.props.hash}`)
      .then(res => {
        const series = res.data.data.results.map(obj => obj);
        this.setState({ series });
      });
  }
  showModal(p) {
    ReactDOM.render(
      <CharacterModal charID={p.id} name={p.name} description={p.description} series={p.series} img={p.thumbnail.path + "/standard_fantastic." + p.thumbnail.extension}/>, document.getElementById('modal')
    );
  }
  handleShow(e) {
    this.showModal(e);
  }
  render() {
    return (
      <div id="series_list">
        {this.state.series.map(series =>
          <div className="series" key={series.id} onClick={(e) => this.handleShow(series)}>
            <img className="series_thumb" src={series.thumbnail.path + "/portrait_fantastic." + series.thumbnail.extension} alt={series.name} />
            <h4 className="title">{series.name}</h4>
          </div>
        )}
      </div>
    );
  }
}

ReactDOM.render(
  <SearchBar />, document.getElementById('searchBar')
);

ReactDOM.render(
  <Characters ts={ts} apiKey={apiKey} hash={hash} />, document.getElementById('root')
);
