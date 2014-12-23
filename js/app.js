// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('ionicApp', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'pascalprecht.translate'])

        .run(function ($ionicPlatform, $rootScope, $firebaseAuth, fireBaseData, $ionicScrollDelegate) {
            $ionicPlatform.ready(function () {

                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                
                /************************************/
                /* VARIABLES                        */
                /************************************/
                $rootScope.settings = {
                    'languages' : [{
                            'prefix':'en',
                            'name':'English'
                        },{
                            'prefix':'fr',
                            'name':'Francais'
                    }] 
                };
                
                $rootScope.members = [{
                    'id':1,
                    'firstnane':'John',
                    'surname':'Doe',
                    'email':'johndoe@gmail.com'
                },{
                    'id':2,
                    'firstnane':'Jane',
                    'surname':'Doe',
                    'email':'janedoe@gmail.com'
                }];
                
                $rootScope.isAdmin = false;
                $rootScope.authData = {};
                
            });
            
                        

            
        })

        .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
            
            /************************************/
            /* TRANSLATE                        */
            /************************************/
            $translateProvider.translations('en', {
                SIGNIN: "Sign-In",
                REGISTER: "Register",
                LOGOUT: "Logout",
                REGISTER_ALREADYHAVEACCOUNT: "I already have an account",
                FORM_EMAIL: "Email",
                FORM_PASSWORD: "Password",
                FORM_FIRSTNAME: "First Name",
                FORM_SURNAME: "Surname",
                TABS_NAME_DASHBOARD: "Dashboard",
                TABS_NAME_EXPENSES: "Expenses",
                TABS_NAME_MEMBERS: "Members",
                TABS_NAME_SETTINGS: "Settings",
                SETTINGS_LANGUAGE: "Change language",
                SETTINGS_EDIT_PROFILE: "Edit Profile",
                SETTINGS_QUIT_HOUSE: "Quit House"
            });
            $translateProvider.translations('fr', {
                SIGNIN: "Se connecter",
                REGISTER: "Creer un compte",
                LOGOUT: "Se deconnecter",
                REGISTER_ALREADYHAVEACCOUNT: "J'ai deja un compte",
                FORM_EMAIL: "Email",
                FORM_PASSWORD: "Mot de passe",
                FORM_FIRSTNAME: "Nom",
                FORM_SURNAME: "Prenom",
                TABS_NAME_DASHBOARD: "Dashboard",
                TABS_NAME_EXPENSES: "Depenses",
                TABS_NAME_MEMBERS: "Membres",
                TABS_NAME_SETTINGS: "Configuration",
                SETTINGS_LANGUAGE: "Changer de langue",
                SETTINGS_EDIT_PROFILE: "Modifier mon profil",
                SETTINGS_QUIT_HOUSE: "Quitter cette maison"
                
            });
            $translateProvider.preferredLanguage("en");
            $translateProvider.fallbackLanguage("en");
            
            /************************************/
            /* ROUTER                        */
            /************************************/
            $stateProvider

                    /* SIMPLE MEMBER STUFF */
                    .state('signin', {
                        url: '/sign-in',
                        templateUrl: 'templates/sign-in.html',
                        controller: 'SignInCtrl'
                    })
                    .state('register', {
                        url: '/register',
                        templateUrl: 'templates/register.html',
                        controller: 'RegisterCtrl'
                    })

                    /* AFTER LOGGED IN */
                    .state('introduction', {
                        url: '/',
                        templateUrl: 'templates/intro/introduction.html',
                        controller: 'IntroductionCtrl'
                    })
                    .state('register-house', {
                        url: '/',
                        templateUrl: 'templates/intro/register-house.html',
                        controller: 'RegisterHouseCtrl'
                    })
                    .state('join-house', {
                        url: '/',
                        templateUrl: 'templates/intro/join-house.html',
                        controller: 'JoinHouseCtrl'
                    })

                    /* ONCE LOGGED IN */
                    .state('tabs', {
                        url: '/tab',
                        abstract: true,
                        templateUrl: 'templates/tabs/tabs.html'
                    })

                    .state('tabs.dashboard', {
                        url: '/dashboard',
                        views: {
                            'tab-dashboard': {
                                templateUrl: 'templates/tabs/dashboard.html',
                                controller: 'DashboardCtrl'
                            }
                        }
                    })
                    .state('tabs.addamember', {
                        url: '/addamember',
                        views: {
                            'tab-dashboard': {
                                templateUrl: 'templates/tabs/add-member.html',
                                controller: 'AddMemberCtrl'
                            }
                        }
                    })
                    .state('tabs.expenses', {
                        url: '/expenses',
                        views: {
                            'tab-expenses': {
                                templateUrl: 'templates/tabs/expenses.html'
                            }
                        }
                    })
                    .state('tabs.settings', {
                        url: '/settings',
                        views: {
                            'tab-settings': {
                                templateUrl: 'templates/tabs/settings.html',
                                controller: 'SettingsCtrl'
                            }
                        }
                    })
                    
                    /* MEMBERS */
                    .state('tabs.members', {
                        url: '/members',
                        views: {
                            'tab-members': {
                                templateUrl: 'templates/tabs/members.html',
                                controller: 'MembersCtrl'
                            }
                        }
                    })
                    .state('tabs.member-detail', {
                        url: '/member/:memberId',
                        views: {
                            'tab-members': {
                                templateUrl: 'templates/tabs/member-detail.html',
                                controller: 'MembersDetailCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/sign-in');

        });

