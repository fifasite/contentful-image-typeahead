var app = new Vue({
    el: '#app',
    data: {
        query: null,
        players: [
            { id: 1, name: "Lionel Messi", imgUrl: "/img/messi.jpg" },
            { id: 2, name: "Cristiano Ronaldo", imgUrl: "/img/ronaldo.jpg" },
            { id: 3, name: "Diego Maradona", imgUrl: "/img/maradona.jpg" },
            { id: 4, name: "Zinedine Zidane", imgUrl: "/img/zidane.jpg" },
            { id: 5, name: "Pele Edson Arantes do Nascimento", imgUrl: "/img/pele.jpg" },
            { id: 6, name: "Johan Cruyff", imgUrl: "/img/cruyff.jpg" },
            { id: 7, name: "Ronaldinho Ronaldo de Assis Moreira", imgUrl: "/img/ronaldinho.jpg" }
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
        }
    },
    mounted() {
        for (let player of this.players) {
            const str = player.name.toLowerCase();
            player['q'] = str.split(" ");
        }
        this.resetSuggestions();
    },
    methods: {
        resetSuggestions() {
            this.suggestions = this.players;
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
        selectPlayer(player) {
            this.selectedPlayers.push(player);
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
        }
    }
})