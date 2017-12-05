import React from 'react';
import axios from 'axios';
import {BrowserRouter as Router, Route, Link, NavLink, Switch} from 'react-router-dom';
import firebase from 'firebase';

export default class Results extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            wineResults: props.results,
            currentPageResults: [],
            startWineIndex: 0,
            endWineIndex: 5,
        }
        this.getPageResults = this.getPageResults.bind(this);
        this.nextPageResults = this.nextPageResults.bind(this);
        this.previousPageResults = this.previousPageResults.bind(this);
        this.addToPantry = this.addToPantry.bind(this);
        this.displayPrice = this.displayPrice.bind(this);
    }

    componentDidMount() {
        this.getPageResults(this.state.startWineIndex, this.state.endWineIndex)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            wineResults: nextProps.results,
            startWineIndex: 0,
            endWineIndex: 5
        }, function(){this.getPageResults(this.state.startWineIndex, this.state.endWineIndex)}.bind(this))
    }


    getPageResults(start, end) {

        if (this.state.wineResults.length > this.state.endWineIndex) {
            let currentResults = this.state.wineResults.slice(start, end+1)
            this.setState({
                currentPageResults: currentResults
            });
        } else {
            console.log('ERROR: not enough wines in wineResults');
            // call API again here ? or not?
        }
    }

    nextPageResults() {
        this.setState({
            startWineIndex: this.state.startWineIndex + 6,
            endWineIndex: this.state.endWineIndex + 6
        }, function(){this.getPageResults(this.state.startWineIndex, this.state.endWineIndex)}.bind(this));
        // return this.getPageResults(this.state.startWineIndex, this.state.endWineIndex);
    }

    previousPageResults() {
        if (this.state.startWineIndex - 6 >= 0) {
            this.setState({
                startWineIndex: this.state.startWineIndex - 6,
                endWineIndex: this.state.endWineIndex - 6
            }, function(){this.getPageResults(this.state.startWineIndex, this.state.endWineIndex)}.bind(this));
            // return this.getPageResults(this.state.startWineIndex, this.state.endWineIndex);
        } else {
            console.log('ERROR ');
        }
    }

    addToPantry(wine) {
        let unique = true;
        const wineApp = firebase.database().ref(`/users/${this.props.userID}/pantry`);
        wineApp.on('value', (snapshot) => {
            let dbPantry = snapshot.val();
            for (let wineKey in dbPantry) {
                if (dbPantry[wineKey].id === wine.id) {
                    // alert('You already have this wine in your pantry');
                    unique = false;
                    return;
                }
            }
        });
        if (unique) {
            let price = Math.round(wine.price_in_cents * .01 * 100) / 100;
            let wineDesc = '';
            if (wine.description) {
                wineDesc = wine.description;
            } else if (wine.style) {
                wineDesc = wine.style;
            }
            const secondCateg = wine.secondary_category;
            let typeWine = '';
            let image_typeWine = "";
            if (secondCateg.match(/Red/)) {
                typeWine = 'red';
                image_typeWine = '../../public/images/Red.png';
            } else if (secondCateg.match(/White/)) {
                typeWine = 'white';
                image_typeWine = '../../public/images/White.png'
            } else {
                typeWine = 'rose';
                image_typeWine = '../../public/images/Rose.png'
            }
            const newDate = new Date();

            const newWine = {
                date: `${newDate}`,
                id: wine.id,
                name: wine.name,
                image_thumb_url: wine.image_thumb_url,
                image_typeWine,
                typeWine,
                varietal: wine.varietal,
                sugar_content: wine.sugar_content.substring(4),
                sugar_content_letters: wine.sugar_content.substring(0,2).replace(/ /g,''),
                description: wineDesc,
                secondary_category: wine.secondary_category,
                userRating: 0,
                userNotes: '',
                price
            };

            console.log(this.props.userID)
            wineApp.push(newWine);
        }
    }

    displayPrice(price) {
        price = price.toString();
        let priceArray = price.split('.')
        if (priceArray.length < 2) {
            price += '.00'
        } else if (priceArray[1].length < 2) {
            price += '0'
        }
        return price
    }
    
    render() {
        return (
            <div className='results'>
                <ul className="clearfix">
                {this.state.currentPageResults.map((wine) => {
                    const secondCateg = wine.secondary_category;
                    let typeWine = '';
                        if (secondCateg.match(/Red/)) {
                            typeWine = 'red'
                        } else if (secondCateg.match(/White/)) {
                            typeWine = 'white'
                        } else  {
                            typeWine = 'rose'
                        }
                    return (
                        <li key={wine.id} className={`wineResult clearfix`}>
                            <div className="wineResult_imageBox">
                                <img src={wine.image_thumb_url} alt={`image of ${wine.name}, a ${wine.secondary_category}`}/>
                            </div>
                            <div className="wineResult_textBox">
                                <h3>{wine.name}</h3>
                                <div className="wineInfo clearfix">
                                    <div className="wineInfo_indicators">
                                        <div className = "wineType clearfix">
                                            <div className={`wineType_indicator ${typeWine}`}></div>
                                            <h6 className = "wineType_name">{wine.varietal}</h6>
                                        </div>
                                        <div className="wineDetails clearfix">
                                            <div className={`wineDetails_indicator`}><h3>{wine.sugar_content.substring(0,2).replace(/ /g,'')}</h3></div>
                                            <h6 className = "wineDetails_name">{wine.sugar_content.substring(4)}</h6> 
                                        </div>
                                    </div>
                                    <div className="winePrice">
                                        <h6>${this.displayPrice(Math.round(wine.price_in_cents * .01 * 100) / 100)}</h6>
                                    </div>
                                </div>
                                {(wine.description || wine.style) ? (wine.description ? <h6 className = "wineStyle_long">{wine.description}</h6> : <h6 className = "wineStyle_short">{wine.style}</h6>) : ''} 
                                {/* nested ternary-- if wine has a description OR a style 
                                    --> check if it has desc, display that, else style
                                    --> if it doesnt have either, display nothing */}
                            </div>
                            <NavLink className="addBtn" to="/pantry"><button onClick={() => {this.addToPantry(wine)}}><i className="fa fa-plus" aria-hidden="true"></i></button></NavLink>
                        </li> 
                            
                )})}
                </ul>
                <footer>
                    <NavLink to="/pantry" className="footerLink">Pantry</NavLink>
                    <button className="previous buttonLeft" onClick={this.previousPageResults}>previous</button>
                    <button className="next buttonRight" onClick={this.nextPageResults}>next</button>
                    <NavLink className="footerLink" to="/">Log Out</NavLink>
                </footer>
            </div>
        );
    }
}
