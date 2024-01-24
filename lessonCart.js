var APP_LOG_LIFECYCLE_EVENTS = true;
var webstore = new Vue({
  el: '#app',
  data: {
    sitename: "LessonCart",
    showLesson: true,
    a: false,
    search: "",
    sortOption: "SUBJECT",
    sortOrder: "ASC",
    sortOptions: {
      SUBJECT: 'Subject',
      AVAILABILITY: 'Availability',
      LOCATION: 'Location',
      PRICE: 'Price',
      RATING: 'Rating'
    },
    sortOrderOptions: {
      ASC: 'Asc',
      DES: 'Des'
    },
    order: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      validation: {
        firstNameInvalid: false,
        lastNameInvalid: false,
        emailInvalid: false,
        phoneInvalid: false
      }
    },
    lessons: {},
    cart: []
  },
  watch: {
    sortOption() {
      this.getLessons();
    },
    sortOrder() {
      this.getLessons();
    },
    search() {
      this.getLessons();
    }
  },
  methods: {
    getLessons() {
      axios.get('./lessons.json')
        .then((response) => {
          var data = response.data.lessons;
          if (data.length > 0) {
            let lessonsArray = data.slice(0);
            var sortField = this.sortOption;
            var selectedSortOrder = this.sortOrder;

            var cartCountMethod = this.cartCount;

            function compare(a, b) {
              var aValue = a.subject;
              var bValue = b.subject;

              if (sortField == "SUBJECT") {
                aValue = a.subject.toLowerCase();
                bValue = b.subject.toLowerCase();
              } else if (sortField == "LOCATION") {
                aValue = a.location.toLowerCase();
                bValue = b.location.toLowerCase();
              } else if (sortField == "PRICE") {
                aValue = a.price;
                bValue = b.price;
              } else if (sortField == "RATING") {
                aValue = a.rating;
                bValue = b.rating;
              } else if (sortField == "AVAILABILITY") {
                aValue = a.availableInventory - cartCountMethod(a.id);
                bValue = b.availableInventory - cartCountMethod(b.id);
              }

              if (aValue < bValue)
                return selectedSortOrder == "DES" ? 1 : -1;
              if (aValue > bValue)
                return selectedSortOrder == "DES" ? -1 : 1;
              return 0;
            }

            lessonsArray = lessonsArray.filter(p => {
              return p.subject.toLowerCase().indexOf(this.search.toLowerCase()) != -1 ||
                p.location.toLowerCase().indexOf(this.search.toLowerCase()) != -1;
            });

            this.lessons = lessonsArray.sort(compare);
          }
        });
    },
    getDefaultOrderDetails() {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        validation: {
          firstNameInvalid: false,
          lastNameInvalid: false,
          emailInvalid: false,
          phoneInvalid: false
        }
      };
    },
    checkRating(n, myLesson) {
      return myLesson.rating - n >= 0;
    },
    addToCart(aLesson) {
      this.cart.push(aLesson.id);
    },
    removeFromCart(aLesson) {
      var index = this.cart.indexOf(aLesson.id);
      if (index > -1) {
        this.cart.splice(index, 1);
      }
      if (this.cart.length < 1) {
        this.showLesson = true;
      }
      return;
    },
    showCheckout() {
      this.showLesson = this.showLesson ? false : true;
    },
    submitForm() {
      alert('Order Placed Successfully');
      this.cart = [];
      this.showLesson = true;
      this.order = this.getDefaultOrderDetails();
    },
    canAddToCart(aLesson) {
      return aLesson.availableInventory > this.cartCount(aLesson.id);
    },
    canPlaceOrder() {
      const lettersOnlyRegex = /^[a-z]+$/i;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phoneRgex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
      var isValid = true;

      if (this.order.firstName == '' || !lettersOnlyRegex.test(this.order.firstName)) {
        this.order.validation.firstNameInvalid = true;
        isValid = false;
      } else {
        this.order.validation.firstNameInvalid = false;
      }
      if (this.order.lastName == '' || !lettersOnlyRegex.test(this.order.lastName)) {
        this.order.validation.lastNameInvalid = true;
        isValid = false;
      } else {
        this.order.validation.lastNameInvalid = false;
      }
      if (this.order.email == '' || !emailRegex.test(this.order.email)) {
        this.order.validation.emailInvalid = true;
        isValid = false;
      } else {
        this.order.validation.emailInvalid = false;
      }
      if (this.order.phone == '' || !phoneRgex.test(this.order.phone)) {
        this.order.validation.phoneInvalid = true;
        isValid = false;
      } else {
        this.order.validation.phoneInvalid = false;
      }

      return isValid;
    },
    canCheckout() {
      return this.cart.length > 0;
    },
    cartCount(id) {
      let count = 0;
      for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i] === id) {
          count++;
        }
      }
      return count;
    },
    findLesson(id) {
      for (var i = 0; i < this.lessons.length; i++) {
        if (this.lessons[i].id === id) {
          return this.lessons[i];
        }
      }
      return;
    }
  },
  computed: {
    cartItemCount() {
      return this.cart.length || '';
    },
    cartLessons() {
      if (this.cart.length > 0) {
        let cartArray = [];
        for (var i = 0; i < this.cart.length; i++) {
          cartArray.push(this.findLesson(this.cart[i]))
        }

        function compare(a, b) {
          if (a.subject.toLowerCase() < b.subject.toLowerCase())
            return -1;
          if (a.subject.toLowerCase() > b.subject.toLowerCase())
            return 1;
          return 0;
        }
        return cartArray.sort(compare);
      }

    }
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
    axios.get('./lessons.json')
      .then((response) => {
        this.lessons = response.data.lessons;
        console.log(this.lessons);
      });
  }
});