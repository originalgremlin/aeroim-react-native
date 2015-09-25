'use strict';

// setup
var React = require('react-native'),
    { AppRegistry, StyleSheet, TabBarIOS, Text, View } = React;
require('react-native-browser-builtins');

// app includes
var _ = require('lodash'),
    ChatActions = require('./src/scripts/actions/chat'),
    Conversations = require('./src/scripts/components/chat/conversations'),
    Roster = require('./src/scripts/components/chat/roster'),
    Settings = require('./src/scripts/components/chat/settings');
//ChatActions.connect();

// https://icons8.com/
var icons = {
    messages: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAEsklEQVRoQ92agXHUMBBFNxUAFQAVQCoAKoBUEKgAUgFQAaQCQgWQCkgqCKmAUAFQAczz6JtFJ/kknXz2sDM3l9xJ8v7d1d9v+Q6szR6a2SMzexam3zMzXthPM/vq3i/M7LLtMuWzDsqHDo6+Ds7frpgncGdm9jGArJy+fXgJEAF47pb7bmZE+nOI/I2Z8cKUHcCSscdmdtfNZc6JG7/dy4IR24C8NLP3bh0i+qbBCcAx79itxf9vC3wsGpIDQjQ/hWiy0GkApKgXLZ4YFAMiq0chq61rDvNSQADxxczY0L9CeXDBnkbJsWduhT3zZFcwMRAP4jpkBBaaw7gWAXrQA0wMhEywOecGocAABqqGDCAByqzJPBBY6YOZwUiU1VyZiB3lWmSGMgMIgKpNQIjMNzPjvXmx6qv/nfDKzN6F4N1vCaKAQLFQLR2Y0lrCyApqAUqGmqtMQMgG1Hg4V+ct8Aomg/KheLJSZQDRAuwN6aWqRToOZl+yV3iHnulfRb0LIEyg4yIbfBfv6F/xUvLFT+Azym0SEEBUmzSl3o2vGEEYKOaE/qFkL04hBDKUNIBcBbpdcn/IOYiGXgbpAEJiFCLCoOYXKVYDyO8waJuArI1uy3h6CoFlj9xxCwAQEFlJs1YgMfEAjgyh/ZKSZm17xJeW72fIGIzPpM/+kTRrA6IOf+5uo+MSTUoagKirwwgstKT5VqCbMEjIm8iJz9hLg6QBiDZYU0ftiJo98COsh/OAwvDPm8oMEEgaWOxMTAUIeHsJwSgnfQ+JnU/FS/tpSICAINI4IQFtnMqOQc8uRTYoGSRSyge+w2Lf1DoOfe9QVpaQKtqnOEtXz5VT6nPo+MQDUaqoPeSKanHujEi0cp1amaS5l3E3F2vsCwwRRpJQWvF9SK6c/Odj30nJkn2BwQnuPwCR6huqiKkyY09xL3WTOw7SgUDT3VpBLUIsugvk0M+fYhZMH4cIyHUKiL5kNM2m6Mam8OpPAwBFuaWc/KXIKPtkY48wSEdCve7fKR0B8HegteyUa46w1mmcEY6DSDMqk6jlssF3OIfpEYKPFPUPAN59jbMuVFt9uJDJ+Chp/HGQznq5GA7E9KvIArT2pIXNDPDUIVwJO3kcfjySBr+Gzk7EAEHaYxBynjrUQx2/KOUBYF8y/A194zSS2z/0mdJONU2QdcgsFTRsAX+rqy9xAmdYOF6cyOokkEVwlCa2hOkIaxSNRIwNkzIypAc6eqijcV7STEnulEbapZxYT9pwJCTtEcrGRx8nATglUyQPyCAl2IuFtpWfurkCNPi464GDxN4SkmYoKZXHrkBEv5SmwLB35ignr8s21EAPIDjt9dlcZaZrJBt1LyBiPB2kQRDIj54nl/42Y+PRQ08ggPHPBvmfctMDz1xTq/kcFuU+faOx9gaCU5QWpzG8OBmUAYgX4CRR1GSpf+bx+RT7oSr0dItSY8MPNgcQra0fDHBxolhjRBxHacCx+XOt8fH2nEC8A4DCAYnI+CcgOqxGUfgfFUjqAEygdK5Fmeks+GhfQGqyARhKjtL0P/0Q1atx08N0oHi+RiAeNE5LsOZkFONXDyRXniIVseLF2jNSXJL/DZA/UvNJcZsGBtgAAAAASUVORK5CYII=',
    roster: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAADeUlEQVRoQ+2ZjZFMQRSFz0ZgRcBGgAgQASJABIgAESACRIAI1kawKwJEgAioT/VRXeO9fq/73p1hartqy0yZ7nfPPef+9TvQnqyDPcGhCyALTF6XdFPSoSQ+s87K34mk79lKyGbkkaTHkq42DAXEE0lvMsFkAcHzx5X3v0p6XzwPEyyYuVWY4jtA3kr6mAEoAwggTgsLnwojLeNg7EVlPIAfRuWWAeSlJCQFCDy+Rv9Ij9+y91Jh5XaEmSgQDPpcDDiS9KXTGPYjPcAAZFhmUSCWCVp/0AnCP38m6amkD5LuDp4RriPo+07R+GgWIgkQY0jy8q6AIAXqRUgWkn4WAMMKGd5YHown8eh/D4RAvSbpRgnaUWXsnJEMaTnz/SgtzZAzotJysN8rlXzECOoJXQE9GJ+HVhSIU+dzSXweWT7jVekKRs4Ip98Mb1qeEVbDQCiCrwM1gD7tW6Fgp0CcfmnL6ZtG1j9R2Z02R/osg86QZ1haGfq2PCP9WhiIjaAwknV6+y320zBSS5hJevf/kXI0/XKQWQEMFb5nWZqhGsIDM4BwDp0rMwXd65rBij3uehmLWzP+KsdkAUES9yX1FEZPlqFCaJRZQJx5YIMMtsQK9YPJkn8jGS81RnyYYwV2CNzWelemwXBsZDPCeWaFz3M3IzBAJ+CRNoWNzGC3Y5yF+M5FBFWbWZzFSMx3Bza3Lr6FXBXQrR9lxcgmEIxk4JpazB1kuDRZnScjOIhixy2LAWE48QNTzB8jdWeWlExGXBeWHFR3vNEROT1rEehkIoxcUxc8WcIKnfPwxVxW1oIFrkvry7k1RdGtu+1AcjjAF97dwT8qLao4xtczNtmJzMRqXQ/Vabrewz6Y8S19F5geIMjG7z/4zCID8WDaDYLYbQf/t+nlTfbMHOmYpIBjyGYsOgPOgqWlLuH3hrVAAIAcDIBGj+9+B1J7rwYz59Up+XE2hbLOdIDgOQBqriUgHE4QW0KkUA5eCk57mX1Ov9QW9pm9lmHs4zlcx1pyzPSz7LSA1G+hkBDUw8A2FwwhUSRHIiD2JsG0gFgiyAgP9b77yAIMuzB5pZXa54DUL3CiF9QZgOpMN9lozgExG6GXLxkIqjNcRCcL7hwQzxahC4FkIL7omGw254DU7XiyPSnH/WX33gNJcds2D1kqiNu0JfSsCyAh953D5l/GfskzIOpAgQAAAABJRU5ErkJggg==',
    settings: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAFAElEQVRoQ+2ajZFNQRCFz0aACBABIkAEiAARIAJEgAjYCBABIkAEdiNABNT36p6tfvfNdM99exe1Zape7d19c2f6dJ/+mZ490NmMX8myR5Kurr3twdoLSroi6Vux7ur7rr6gpFuSPkj6ND1HTB8l3ZR0WxLPq42zAPJM0lNJzyXxHMcbSfclPZH0cjUUkkaBXJwo82Vg80xYg3wl6fHAWtcl4VM/qrkjQAABVeA+giBENjL6ZLSbr/lo2g8gUDEFUwExCDTj8U7Sw2RhR6xLjTms9336O9+3BnNeS7obvoQJKZgMSATxdeI0vL4wCXJv5rBY7M4076ck3m8NNMsaUOv9RB3Pw2Jvp3dZgzl8rklKwfSAzEGwAQIgLD5A5GEADGFwbuZ4tCKWvzP14u8EBpRgv+H9BxNIZOGdFEwLSA9E1K6dNv7tWBK0A2gVFKAqgvLBOnG0ol0JpgcEB2ODLEwiDEKzCcB4Xjp41/TB4vhFTwnMeyEJysGMLefvUYsF4SrjRrK4/aAMjwXCah2U9nlaA9/E8lsjc3bnAzQEmL85AAGYbv6pohYgLmcL/AF09kd8EDBN61d5xAkMeVevjwaUEPfPKD5UolgjBAAWO60/DMi/mYLfQCkcuxXJhn3EE62V1LQz6XiH4hAquCqApnwOBytfgDh6cn7huTsqavEidRaCUZZUIRahCZExObY2J8ER2qt8YzYAnpyzNxAfkrAGz9kABKDRJLGerE+YtLB8T1gnH7jMwe8yMMNWqSwyWnZHEGgPYXu+hHCAhHrMqcAMnWEMBG0TZqEEz3wiPdKIEehXUiCY1AJCM8D0RkzOzGE+/sKHZ9hyBJCsUQBFMH3GeQeDZumQCBhpU4V2BMbq87rsZPkIhIoToUHqCDMSaodM3wE07MzT+4B3JIQ1PG8q8Qik8peecl0+VPRrve8a6jRl0IZRawAxNfdVxCrv/wcSeAItOL2dhlocpWNfoEhZW1/vUMthzY7O4kucvayHGtLt4+wobSdNQC2iFDmkNQACQA4zveHwy1xqohHwrEUEorXKzyr8UjFgsV5D49gO2g1rk/QVbdxQIBRTk40MWj7UT1mjgnViQnRei2li03qtIg2lBI2yqjOItliQhAUYCsKsRKGwBASCuZvYA+88lRatFRAXjSNXAREMINwqikWjWz4uLKFlVTSafq2G31Zmr2hg2oyW8QBw36u3duxbZfsPB4PKImxiZ15yQuQdqIOViDIMoiDahyojVwoxGKxysLKfIIg7jpUV1/geIG5+lKG9ssjw4X8NyRtrxH5WGqKrdpAdbfWLmQXA7SdpnsqA0GkkhldxfoFMe091wOHo3EzOPSBpnzWIU7U6RyWv1iEN4C/dfnQLSDx/ZyEX/yE7MzA/x9ylAwAkXJ/x2a8X0YiC7Nc85/e68dV9BJl5fgdIeMb0AKraPCiL5gPCzesnlEKUiqO86sguelpgEACtuORmQ+axeUyCSy56AM77gOLCiIEisA4/SxC8UEWtCIZE5itlOhfzuwx4zN+wVlbScIeIcERCLBg7iCiIv7kax+pOrGkeq/JIvCmyqSkg0WCvKMyOrqwHkOyO0RdH+I5HmYwrICxkMGgc7excssz4vNb1NNaFBVisrChGgBgMP0cOTVnZ7bBeHQusmyosn+hwFMiSsPpP/wvHEiDn5p9qzs2/OWG9rJ88ckWxhAGbub8BxRF/G0Yig3AAAAAASUVORK5CYII='
};

var AeroIM = React.createClass({
    getInitialState: function () {
        return {
            selected: 'Roster'
        };
    },

    render: function() {
        return (
            <TabBarIOS>
                <TabBarIOS.Item
                    title='Roster'
                    icon={{ uri: icons.roster, scale: 3 }}
                    selected={ this.state.selected === 'Roster' }
                    onPress={ this.handlePress.bind(this, 'Roster') } >
                    <Roster />
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    title='Messages'
                    icon={{ uri: icons.messages, scale: 3 }}
                    selected={ this.state.selected === 'Messages' }
                    onPress={ this.handlePress.bind(this, 'Messages') } >
                    <Conversations />
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    title='Settings'
                    icon={{ uri: icons.settings, scale: 3 }}
                    selected={ this.state.selected === 'Settings' }
                    onPress={ this.handlePress.bind(this, 'Settings') } >
                    <Settings />
                </TabBarIOS.Item>
            </TabBarIOS>
        );
    },

    handlePress: function (selected, evt) {
        this.setState({ selected: selected });
    }
});

AppRegistry.registerComponent('AeroIM', () => AeroIM);
