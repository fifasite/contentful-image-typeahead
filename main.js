
window.contentfulExtension.init(function (sdk) {
    // Automatically adjust UI Extension size in the Web App.
    sdk.window.startAutoResizer();

    // Get current value of field
    let value = sdk.field.getValue()
    console.log("[contentful-image-typeahead] value:", value);

    // Set value of field to "Hello World!"
    //sdk.field.setValue("Hello world!")


    new Vue({
        el: '#app',
        data: {
            query: null,
            players: [
                { id: 1, name: "Lionel Messi", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/messi.jpg" },
                { id: 2, name: "Cristiano Ronaldo", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/ronaldo.jpg" },
                { id: 3, name: "Diego Maradona", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/maradona.jpg" },
                { id: 4, name: "Zinedine Zidane", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/zidane.jpg" },
                { id: 5, name: "Pele Edson Arantes do Nascimento", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/pele.jpg" },
                { id: 6, name: "Johan Cruyff", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/cruyff.jpg" },
                { id: 7, name: "Ronaldinho Ronaldo de Assis Moreira", imgUrl: "https://thomaskokholm.github.io/contentful-image-typeahead/img/ronaldinho.jpg" }
            ],
            selectedPlayers: [],
            suggestions: []
        },
        computed: {
            showSuggestions() {
                if (this.suggestions.length > 0) {
                    return true;
                }
                return false;
            },
            showSelectedPlayers() {
                if (this.selectedPlayers.length > 0) {
                    return true;
                }
                return false;
            },
            jsonsDataString() {
                if (this.selectedPlayers.length > 0) {
                    return JSON.stringify(this.selectedPlayers);
                }
                return "";
            }
        },
        mounted() {
            // When UI Extensions SDK is loaded the callback will be executed.


            for (let player of this.players) {
                const str = player.name.toLowerCase();
                player['q'] = str.split(" ");
            }
            this.resetSuggestions();
        },
        methods: {
            resetSuggestions() {
                //this.suggestions = this.players;
                this.suggestions = [];
            },
            search() {
                if (this.query === "") {
                    this.resetSuggestions();
                } else {
                    this.suggestions = [];
                    for (let player of this.players) {
                        /*
                        if (player.q.indexOf(this.query.toLowerCase()) > -1) {
                            console.log("got one or more matches", player.id);
                            this.suggestions.push(player);
                        }
                        */
                        for (let token of player.q) {
                            if (token.search(this.query) > -1) {
                                this.addSuggestion(player);
                            }
                        }
                    }
                }

                //this.suggestions.push(this.players[0]);
            },
            selectPlayer(selected) {
                this.resetSuggestions();
                this.query = null;

                let found = false;
                for (let player of this.selectedPlayers) {
                    if (player == selected.name) {
                        found = true;
                    }
                }
                if (!found) {
                    this.selectedPlayers.push(selected.name);
                    sdk.field.setValue(JSON.stringify(this.selectedPlayers));
                }
            },
            addSuggestion(suggestedPlayer) {
                let found = false;
                for (let player of this.suggestions) {
                    if (player.id == suggestedPlayer.id) {
                        found = true;
                    }
                }
                if (!found) {
                    this.suggestions.push(suggestedPlayer);
                }
            },
            removeSelectedPlayer(selected) {
                this.selectedPlayers = this.selectedPlayers.filter(function (obj) {
                    return obj.name !== selected.name;
                });
            }
        }
    });


});
