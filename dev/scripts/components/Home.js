import React from 'react';
import Heading from './Heading'
import MainWineImage from './MainWineImage'
import LogIn from './LogIn'

class Home extends React.Component {
    render() {
        return (
            <div className="home">
                <Heading />
                <MainWineImage />
                <LogIn />
            </div>
        );
    }
}

export default Home;