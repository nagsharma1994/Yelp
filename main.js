//Make an api call if the categories is not available in the local storage
let categories = [];
const authorizationKey = 'Bearer txLSVZQYCrubCoAK8CW9MatFEfpDmITr-dJ1MWsMYC86lfLrJMIWe17nmJAB8LkoR_90dSNDHbrE7HrEs8E2K1JHkFicoBZ5DAiJrlr5TFARWJuGMKzlF7I8tRrTXHYx';

if (window.localStorage.getItem('categories') === null) {
    getCategories();
} else {
    categories = window.localStorage.getItem('categories');
    createMainCategories(JSON.parse(categories));
}
// static list group
document.querySelector('#listGroup').addEventListener('click', function (event) {
    const category = event.target.getAttribute('category');
    getBusinesses(category);
});
// more categories click event
document.querySelector('#listGroup a:last-child')
    .addEventListener('click', function (event) {
        var listGroup = document.querySelector('#listGroup');
        var listGroupMore = document.querySelector('#listGroup_more');
        listGroup.style.display = 'none';
        listGroupMore.style.display = 'flex';
    });

document.querySelector('#listGroup_more').addEventListener('click', function (event) {
    const category = event.target.getAttribute('category');
    getBusinesses(category);

});

//do something when switch is clicked
document.querySelector('.switch').addEventListener('click', function (event) {
    console.log(event.target.value);
});

//To get the details of the business
document.querySelector('#business_list').addEventListener('click', function (event) {
    const businessId = event.target.parentElement.getAttribute('businessId');
    createBusinessListPage(businessId);
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
        let anchorElem = '<a class="list-group-item list-group-item-action icon_separator"' + 'category=' + element.title + '>' +
            element.title + '<i class="fas fa-chevron-right"></i></a>';
        anchorElems = anchorElems + anchorElem;
    });

    listGroupHTML = listGroupHTML + anchorElems;
    document.querySelector('#listGroup_more').innerHTML = listGroupHTML;
}

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
    document.querySelector('.switch').style.display = 'flex';

    let businessListHTML = document.querySelector('#business_list').innerHTML;
    let mainCard = '';
    businesses.forEach(function (business) {
        const distance = Math.round(business.distance / 1000);
        const location = business.location;
        const name = business.name;
        let price = '';
        if (business.price) {
            price = business.price;
        }
        let starRating = getStars(business.rating);

        let card = '<div class="card" businessId ="' + business.id + '">' +
            '<img class="card-img-left img-thumbnail" src="' + business.image_url + '" alt="Card image cap">' +
            '<div class="card-body"><span class="title_distance"><h5 class="card-title" >' + name + '</h5><h6>' + distance + ' km</h6></span><span class="star-rating">' + starRating + '</span>' +
            '<span class="card-text">' + business.review_count +
            ' posts</span><div businessId ="' + business.id + '"><h6>' + price + ' ' + location.country +
            '</h6></div><div businessId ="' + business.id + '"><h6>' + location.address1 + ' ' + location.city + '</h6></div></div></div>';

        mainCard = mainCard + card;
    });

    businessListHTML = businessListHTML + mainCard;
    document.querySelector('#business_list').innerHTML = businessListHTML;

}

function createBusinessListPage(businessId) {
    if (businessId !== null) {
        const businessDetailsByIDUrl = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/' + businessId;

        const businessReviewsByIDUrl = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/' + businessId + '/reviews';

        const apiRequest1 = fetch(businessDetailsByIDUrl, {
            method: 'GET', // or 'PUT' // data can be `string` or {object}!
            headers: {
                'Authorization': authorizationKey,
                'Access-Control-Allow-Origin': '*'
            }
        }).then(function (response) {
            return response.json();
        });

        const apiRequest2 = fetch(businessReviewsByIDUrl, {
            method: 'GET', // or 'PUT' // data can be `string` or {object}!
            headers: {
                'Authorization': authorizationKey,
                'Access-Control-Allow-Origin': '*'
            }
        }).then(function (response) {
            return response.json();
        });
        let combinedData = {
            "businessDetails": {},
            "reviewDetails": {}
        };

        Promise.all([apiRequest1, apiRequest2]).then(function (values) {
            combinedData["businessDetails"] = values[0];
            combinedData["reviewDetails"] = values[1];
            console.log(combinedData);
            createBusinessDetails(combinedData);
        });

    }
}

function createBusinessDetails(businessData) {
    const business = businessData.businessDetails;
    const reviews = businessData.reviewDetails;
    const fullreviews = businessData.reviewDetails.reviews;
    console.log(fullreviews);

    document.querySelector('#listGroup').style.display = 'none';
    document.querySelector('#listGroup_more').style.display = 'none';
    document.querySelector('.switch').style.display = 'none';
    document.querySelector('#business_list').style.display = 'none';

    let businessDetailsHtml = document.querySelector('#business_details').innerHTML;
    //console.log(reviews);
    let photosDiv = '';
    business.photos.forEach(function (photo) {
        let photoDiv = '<img src="' + photo + '" class="card-img-bottom img-thumbnail"/>';
        photosDiv = photosDiv + photoDiv;
    });

    let stars = getStars(business.rating);

    let reviewDetails = createReviewDetails(fullreviews);

    let businessDetailsDiv = '<div class="textsize"><h5 class="card-title ">' + business.name + '</h5><div>' + business.categories[0].title + '</div><div><span>' + business.hours[0].open[0].start + ' - ' + business.hours[0].open[0].end + '</span></div><div ><span>' + 'contribution' + '</span><span>' + 'call' + '</span> <span>' + 'Direction' + ' </span> <span>' + 'website' + '</span></div><div>' + stars + '</div><div>' + photosDiv + '</div></div><div>' + reviewDetails + '<br /></div>';
    // console.log(reviews.reviews[0].text);

    let reviewsDiv = '';

    document.querySelector('#business_details').innerHTML = businessDetailsDiv + reviewsDiv;
}

function createReviewDetails(reviews) {
    let reviewDetailsCards = ''

    for (var i = 0; i < reviews.length; i++) {
        let reviewDetailsCard = '';
        let reviewDetailsTextDiv = '';
        let reviewDetailsImageDiv = '';
        let reviewUserNameDiv = '';
        let starRatingDiv = '';
        let dateDiv = '';

        let starRating = getStars(reviews[i].rating);

        reviewDetailsImageDiv = '<img class = "card-img-left img-thumbnail" src = "' +
            reviews[i].user.image_url + '"></img>';

        reviewUserNameDiv = '<div class="card-body"><span class="title_distance"><h5 class="card-title" >' + reviews[i].user.name + '</h5></span>';

        starRatingDiv = '<span class="star-rating">' + starRating + '</span>';

        dateDiv = '<span class="card-text">' + reviews[i].time_created + '</span>';
        reviewDetailsTextDiv = '<div><h6>' + reviews[i].text + '</h6></div></div>';

        reviewDetailsCard = '<div class="card">' + reviewDetailsImageDiv +
            reviewUserNameDiv + starRatingDiv + dateDiv + reviewDetailsTextDiv +
            '</div>';

        reviewDetailsCards = reviewDetailsCards + reviewDetailsCard;
    }

    return reviewDetailsCards;
}

function getStars(rating) {

    // Round to nearest half 
    rating = Math.round(rating * 2) / 2;
    let starRating = [];

    // Append all the filled whole stars
    for (var i = rating; i >= 1; i--) {
        starRating.push('<i class="fas fa-star fa-xs" aria-hidden="true" style="color: red;"></i>&nbsp;');
    }

    // If there is a half a star, append it
    if (i == .5) {
        starRating.push('<i class="fas fa-star-half-alt fa-xs" aria-hidden="true" style="color: red;"></i>&nbsp;');
    }
    // Fill the empty stars
    for (let i = (5 - rating); i >= 1; i--) {
        starRating.push('<i class="far fa-star fa-xs" aria-hidden="true" style="color: red;"></i>&nbsp;');
    }

    return starRating.join('');

}