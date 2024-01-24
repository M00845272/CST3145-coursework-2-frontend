var APP_LOG_LIFECYCLE_EVENTS = true;
var webstore = new Vue({
  el: '#app',
  data: {
    sitename: "BestDeals",
    showProducts: true,
    a: false,
    search: "",
    products: {}
  },
  watch: {
    search() {
      this.getProducts();
    }
  },
  methods: {
    getProducts() {
      axios.get('./products.json')
        .then((response) => {
          var data = response.data.products;
          if (data.length > 0) {
            let productsArray = data.slice(0);
           

            function compare(a, b) {
              var aValue = a.price;
              var bValue = b.price;
              if (aValue < bValue)
                return 1;
              if (aValue > bValue)
                return -1;
              return 0;
            }

            productsArray = productsArray.filter(p => {
              return p.subject.toLowerCase().indexOf(this.search.toLowerCase()) != -1 ||
                p.location.toLowerCase().indexOf(this.search.toLowerCase()) != -1;
            });

            this.products = productsArray.sort(compare);
          }
        });
    },
    findProduct(id) {
      for (var i = 0; i < this.products.length; i++) {
        if (this.products[i].id === id) {
          return this.products[i];
        }
      }
      return;
    }
  },
  computed: {
  },
  filters: {
    formatPrice(price) {
      if (!parseInt(price)) { return ""; }
      if (price > 99999) {
        var priceString = (price / 100).toFixed(2);
        var priceArray = priceString.split("").reverse();	
        var index = 3;
        while (priceArray.length > index + 3) {
          priceArray.splice(index + 3, 0, ",");
          index += 4;
        }
        return "£" + priceArray.reverse().join("");	
      } else {
        return "£" + (price / 100).toFixed(2);	//#H
      }
    }

  },
  created: function () {
    axios.get('./products.json')
      .then((response) => {
        this.products = response.data.products;
        console.log(this.products);
      });
  }
});