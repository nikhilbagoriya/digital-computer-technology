(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();
    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Team carousel
    $(".team-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: false,
        dots: false,
        loop: true,
        margin: 50,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


    // Testimonial carousel

    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: true,
        dots: true,
        loop: true,
        margin: 0,
        nav : true,
        navText: false,
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


     // Fact Counter

     $(document).ready(function(){
        $('.counter-value').each(function(){
            $(this).prop('Counter',0).animate({
                Counter: $(this).text()
            },{
                duration: 2000,
                easing: 'easeInQuad',
                step: function (now){
                    $(this).text(Math.ceil(now));
                }
            });
        });
    });



})(jQuery);

// const scriptURL = 'https://script.google.com/macros/s/AKfycbzkpukXAKM2iRjGs7CE1GcybCa-Wf8mKr0vbdt3xzh5zRmBXcKbVSz8pKqJVix568Vb/exec'


// const form = document.forms['service-form']


// form.addEventListener('submit', e => {
//   e.preventDefault()
//   fetch(scriptURL, { method: 'POST', body: new FormData(form)})
//   .then(response => alert("Thank you! your form is submitted successfully." ))
//   .then(() => { window.location.reload(); })
//   .catch(error => console.error('Error!', error.message))
// })

//testomonial clien review start
jQuery(document).ready(function($) {

    var feedbackSlider = $('.feedback-slider');
    feedbackSlider.owlCarousel({
      items: 1,
      nav: true,
      dots: true,
      autoplay: true,
      loop: true,
      mouseDrag: true,
      touchDrag: true,
      navText: ["<i class='fa fa-long-arrow-left'></i>", "<i class='fa fa-long-arrow-right'></i>"],
      responsive:{
  
        // breakpoint from 767 up
        767:{
          nav: true,
          dots: false
        }
      }
    });
  
    feedbackSlider.on("translate.owl.carousel", function(){
      $(".feedback-slider-item h3").removeClass("animated fadeIn").css("opacity", "0");
      $(".feedback-slider-item img, .feedback-slider-thumb img, .customer-rating").removeClass("animated zoomIn").css("opacity", "0");
    });
  
    feedbackSlider.on("translated.owl.carousel", function(){
      $(".feedback-slider-item h3").addClass("animated fadeIn").css("opacity", "1");
      $(".feedback-slider-item img, .feedback-slider-thumb img, .customer-rating").addClass("animated zoomIn").css("opacity", "1");
    });
    feedbackSlider.on('changed.owl.carousel', function(property) {
      var current = property.item.index;
      var prevThumb = $(property.target).find(".owl-item").eq(current).prev().find("img").attr('src');
      var nextThumb = $(property.target).find(".owl-item").eq(current).next().find("img").attr('src');
      var prevRating = $(property.target).find(".owl-item").eq(current).prev().find('span').attr('data-rating');
      var nextRating = $(property.target).find(".owl-item").eq(current).next().find('span').attr('data-rating');
      $('.thumb-prev').find('img').attr('src', prevThumb);
      $('.thumb-next').find('img').attr('src', nextThumb);
      $('.thumb-prev').find('span').next().html(prevRating + '<i class="fa fa-star"></i>');
      $('.thumb-next').find('span').next().html(nextRating + '<i class="fa fa-star"></i>');
    });
    $('.thumb-next').on('click', function() {
      feedbackSlider.trigger('next.owl.carousel', [300]);
      return false;
    });
    $('.thumb-prev').on('click', function() {
      feedbackSlider.trigger('prev.owl.carousel', [300]);
      return false;
    });
    
  }); //end ready
//testomonial clien review End

var loader=document.getElementById("pre-loader");
window.addEventListener("load", function(){
    this.setTimeout(function () {
        loader.style.display="none";
    },3000);
});

// buttons
let onlinebtnform=document.getElementById("online-btn-form");
let offlinebtnform=document.getElementById("offline-btn-form");
let onlineofflineformcontant1=document.getElementById("online-offline-form-contant1");
let onlineofflineformcontant2=document.getElementById("online-offline-form-contant2");

offlinebtnform.addEventListener("click",()=>{
    window.location.href = "services.html";
})
onlinebtnform.addEventListener("click",()=>{
    window.location.href = "contact.html";
})

// login form
const loginformacti=document.getElementById("loginformacti");
const clButtonClose=document.getElementById("clButtonClose");
const mainformlogn=document.getElementById("mainformlogn");
loginformacti.addEventListener("click",()=>{
    mainformlogn.style.display="block"
})
clButtonClose.addEventListener("click",()=>{
    mainformlogn.style.display="none";
})

//firebase
const firebaseApp = firebase.initializeApp({ 
    apiKey: "AIzaSyCxfRp5Lbi9KZzUbaI4IAOsl1E94SPKs64",
  authDomain: "web-admin-e4430.firebaseapp.com",
  projectId: "web-admin-e4430",
  storageBucket: "web-admin-e4430.firebasestorage.app",
  messagingSenderId: "3269549295",
  appId: "1:3269549295:web:cd7a04f372047c296c0f1a"
 });
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

const singIn=()=>{
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const errormsg=document.getElementById("errormsg");
    const adminpanelstoreanddisplay=document.getElementById("adminpanelstoreanddi");
    const mainformlogn=document.getElementById("mainformlogn");
    const successmsglg=document.getElementById("successmsglg");

    firebase.auth().signInWithEmailAndPassword(email, password)
  .then((result) => {
    // Signed in
    errormsg.style.display="none";
    successmsglg.style.display="block";
    setTimeout(successsulg, 3000);
        function successsulg() {
            mainformlogn.style.display="none";
            adminpanelstoreanddisplay.style.display="block";
        }
    // window.location.href = 'http://www.google.com';
    // ...
  })
  .catch((error) => {
    successmsglg.style.display="none";
    errormsg.style.display="block";
    // alert(error.code);
    // alert(error.message);
  });
}


// admin panel

const adminnoticlosebtn=document.getElementById("adminnoticlosebtn");
adminnoticlosebtn.addEventListener("click",()=>{
    adminpanelstoreanddi.style.display="none";
})

// const inputdate=document.getElementById("inputdate").value;
//             const inputtitle=document.getElementById("inputtitle").value;
//             const inputcomment=document.getElementById("inputcomment").value;
//             const adminbtnSubmit=document.getElementById("adminbtnSubmit");
//             const Notificationsdata=document.getElementById("Notificationsdata");

// Online form button redirect
document.getElementById("online-btn-form").addEventListener("click", function() {
    window.location.href = "contact.html";
});

