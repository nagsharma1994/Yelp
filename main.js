//Make an api call if the categories is not available in the local storage
let categories = [];
const authorizationKey = 'Bearer txLSVZQYCrubCoAK8CW9MatFEfpDmITr-dJ1MWsMYC86lfLrJMIWe17nmJAB8LkoR_90dSNDHbrE7HrEs8E2K1JHkFicoBZ5DAiJrlr5TFARWJuGMKzlF7I8tRrTXHYx';

if (window.localStorage.getItem('categories') === null) {
    getCategories();
} else {
    categories = window.localStorage.getItem('categories');
    createMainCategories(JSON.parse(categories));
}

document.querySelector('#listGroup').addEventListener('click', function (event) {
    const category = event.target.getAttribute('category');
    getBusinesses(category);
});

document.querySelector('#listGroup_more').addEventListener('click', function (event) {
    const category = event.target.getAttribute('category');
    getBusinesses(category);
});

function getCategories() {
    const categories_url = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/categories';

    fetch(categories_url, {
        method: 'GET', // or 'PUT' // data can be `string` or {object}!
        headers: {
            'Authorization': authorizationKey,
            'Access-Control-Allow-Origin': '*'
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        /* append the locations which is captured in 
        data.categories varibale to the datalist */
        categories = data.categories;
        window.localStorage.setItem('categories', JSON.stringify(categories));
        createMainCategories(data.categories);
    });
}

function createMainCategories(categories) {
    var mainCategories = [];
    for (var i = 0; i < categories.length; i++) {
        //console.log(categories[i].parent_aliases);
        if (categories[i].parent_aliases.length === 0) {

            mainCategories.push(categories[i]);
        }
    }

    createMainCategoriesList(mainCategories);
}

function createMainCategoriesList(categories) {
    let listGroupHTML = document.querySelector('#listGroup_more').innerHTML;
    let anchorElems = '';
    categories.forEach(function (element) {
        let anchorElem = '<a class="list-group-item list-group-item-action icon_separator" category="' + element.title + '"><span category="' + element.title + '">' +
            element.title + '</span><i class="fas fa-chevron-right"></i></a>';
        anchorElems = anchorElems + anchorElem;
    });

    listGroupHTML = listGroupHTML + anchorElems;
    document.querySelector('#listGroup_more').innerHTML = listGroupHTML;
}

document.querySelector('#listGroup a:last-child')
    .addEventListener('click', function (event) {
        var listGroup = document.querySelector('#listGroup');
        var listGroupMore = document.querySelector('#listGroup_more');
        listGroup.style.display = 'none';
        listGroupMore.style.display = 'flex';
    });

let businesses = [];

function getBusinesses(category) {
    if (category != null) {
        const business_url = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=' + category + '&location=Berlin';

        fetch(business_url, {
            method: 'GET', // or 'PUT' // data can be `string` or {object}!
            headers: {
                'Authorization': authorizationKey,
                'Access-Control-Allow-Origin': '*'
            }
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            const businesses = data.businesses;
            console.log(businesses);
            createBusinessList(businesses);
        });
    }
}

function createBusinessList(businesses) {
    document.querySelector('#listGroup').style.display = 'none';
    document.querySelector('#listGroup_more').style.display = 'none';

    let businessListHTML = document.querySelector('#business_list').innerHTML;
    let mainCard = '';
    businesses.forEach(function (business) {
        const distance = Math.round(business.distance / 1000);
        const location = business.location;
        let price = '';
        if (business.price) {
            price = business.price;
        }
        let card = '<div class="card">' +
            '<img class="card-img-left img-thumbnail" src="' + business.image_url + '" alt="Card image cap">' +
            '<div class="card-body"><span class="title_distance"><h5 class="card-title">' + business.name + '</h5><h6>' + distance + ' km</h6></span>' +
            '<h6 class="card-text">' + business.review_count +
            ' posts</h6><div><h6>' + price + ' ' + location.country +
            '</h6></div><div><h6>' + location.address1 + ' ' + location.city + '</h6></div></div></div>';

        mainCard = mainCard + card;
    });

    businessListHTML = businessListHTML + mainCard;
    document.querySelector('#business_list').innerHTML = businessListHTML;
}