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
      availableInventory: 'Availability',
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
    cart: [],
    URL: 'https://lessoncart-backend-env.eba-zpnrayrg.eu-west-2.elasticbeanstalk.com'
    //URL: 'http://localhost:3000'
  },
  watch: {
    sortOption() {
      this.loadLessons();
    },
    sortOrder() {
      this.loadLessons();
    },
    search() {
      this.loadLessons();
    }
  },
  methods: {
    loadLessons(){
      if (webstore.search == undefined || webstore.search == null || webstore.search == '') {
        webstore.getLessons();
      } else {
        webstore.searchLessons();
      }
    },
    getLessons() {
      var sortField = webstore.sortOption;
      var selectedSortOrder = webstore.sortOrder;
      let lessonsURL = webstore.URL + "/lessons/20/" + sortField.toLowerCase() + "/" + selectedSortOrder.toLowerCase()
      fetch(lessonsURL).then(
        function (response) {
          response.json().then(
            function (json) {
              console.log(json);
              webstore.lessons = json;
            }
          )
        }
      );
    },
    searchLessons() {
      webstore.lessons = [];
      var sortField = webstore.sortOption;
      var selectedSortOrder = webstore.sortOrder;
      let serachKeyword = webstore.search || '*';
      let searchURL = webstore.URL + "/lessons/search/" + serachKeyword + "/20/" + sortField.toLowerCase() + "/" + selectedSortOrder.toLowerCase()
      fetch(searchURL).then(
        function (response) {
          response.json().then(
            function (json) {
              var data = json;
              if (data.length > 0) {
                let lessonsArray = data.slice(0);
                webstore.lessons = lessonsArray;
              }
            }
          );
        })
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
    getImageSrc(imagePath) {
      return webstore.URL + "/lesson/images/" + imagePath;
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
      let lessons = {};
      webstore.cart.forEach(function (lessonId) {
        // If the lesson is not already a key, initialize it with count 1
        if (!lessons[lessonId]) {
          lessons[lessonId] = 1;
        } else {
          // If the lesson is already a key, increment the count
          lessons[lessonId]++;
        }
      });

      let orderDetails = {
        "firstName": webstore.order.firstName,
        "lastName": webstore.order.lastName,
        "email": webstore.order.email,
        "phoneNumber": webstore.order.phone,
        "lessons": lessons
      }
      // Send POST request using Fetch API
      fetch(webstore.URL + '/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Order created successfully:', data);
          webstore.cart = [];
          webstore.showLesson = true;
          webstore.order = this.getDefaultOrderDetails();
          webstore.updateAvailableSpaces(lessons);
          alert('Order Placed Successfully');
          webstore.searchLessons();
        })
        .catch(error => {
          console.error('Error creating order:', error);
          alert('Error creating order');
        });
    },
    updateAvailableSpaces(cart) {
      // Send PUT request using Fetch API
      fetch(webstore.URL + '/lesson/update_availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cart),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Available spaces updated successfully:', data);
        })
        .catch(error => {
          console.error('Error updating available spaces:', error);
        });
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
    fetch(this.URL + "/lessons/20/subject/asc").then(
      function (response) {
        response.json().then(
          function (json) {
            console.log(json);
            webstore.lessons = json;
          }
        )
      }
    );
  }
});