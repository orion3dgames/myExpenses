angular.module('starter.services', [])
        /**
         * A simple example service that returns some data.
         */
        .factory('fireBaseData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {
            
            var ref = new Firebase("https://myexpenses.firebaseio.com/"),
            refExpenses = new Firebase("https://myexpenses.firebaseio.com/expenses"),
            refRoomMates = new Firebase("https://myexpenses.firebaseio.com/roommates"),
            refHouses = new Firebase("https://myexpenses.firebaseio.com/houses");

            var currentData = {
                currentUser: false,  
                currentHouse: false,  
                idadmin: false
            };

            $rootScope.notify = function(title,text) {
                var alertPopup = $ionicPopup.alert({
                  title: title ? title : 'Error',
                  template: text
                });
            };
            
            $rootScope.show = function (text) {
                $rootScope.loading = $ionicLoading.show({
                    template: '<i class="icon ion-looping"></i><br>' + text,
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });
            };
            
            $rootScope.hide = function (text) {
                $ionicLoading.hide();
            };
            
            $rootScope.checkSession = function () {
                $rootScope.show('LOGGING IN');
                $rootScope.authData = ref.getAuth();
                if ($rootScope.authData) {
                    $rootScope.hide();
                    $state.go('tabs.dashboard');
                   
                }else{
                    $rootScope.hide();
                    $state.go('signin');
                }
            };
            
            $rootScope.refreshData = function () {
                $rootScope.show('Updating Data');
                $rootScope.authData = ref.getAuth();
                if ($rootScope.authData) {
                    var user_email = $rootScope.authData.password.email;
                    
                    if(!$rootScope.currentHouse && !$rootScope.currentHouse){
                        console.log('EMPTY: '+user_email);
                    }else{
                        $rootScope.hide();
                        return;
                    };
                    
                    /* GET USER DATA */
                    var usersRef = refRoomMates.child(escapeEmailAddress(user_email));
                    usersRef.once("value", function(snap) {
                        $rootScope.currentUser = snap.val();
                        var housesRef = refHouses.child($rootScope.currentUser.houseid);
                        housesRef.once("value", function(snap) {
                            $rootScope.currentHouse = snap.val();
                            $rootScope.hide();
                        });
                    });
                }else{
                    $rootScope.hide();
                    $state.go('signin');
                }
            };
                    
            return {
                ref: function () {
                    return ref;
                },
                refExpenses: function () {
                    return refExpenses;
                },
                refRoomMates: function () {
                    return refRoomMates;
                },
                refHouses: function () {
                    return refHouses;
                },
                checkDuplicateEmail: function (email) {
                    var deferred = $q.defer();
                    var usersRef = refRoomMates.child(escapeEmailAddress(email));
                    usersRef.once("value", function(snap) {
                        if(snap.val() === null){
                            deferred.resolve(true);
                        }else{
                            deferred.reject('EMAIL EXIST');
                        }
                        
                    });                
                    return deferred.promise;
                },
                checkAuth: function () {
                    var deferred = $q.defer();
                    var authData = ref.getAuth();
                    if (authData) {
                        deferred.resolve(authData);
                    }else{
                        var err = 'TEST';
                        deferred.reject(err);
                    }   
                    return deferred.promise;
                },
                refreshData: function (user_email) {
                    var deferred = $q.defer();
                    console.log(currentData);
                    if(currentData){
                        var usersRef = refRoomMates.child(escapeEmailAddress(user_email));
                        usersRef.once("value", function(snap) {
                            currentData.currentUser = snap.val();
                            var housesRef = refHouses.child(currentData.currentUser.houseid);
                            housesRef.once("value", function(snap) {
                                currentData.currentHouse = snap.val();
                                currentData.isadmin = (currentData.currentHouse.admin === currentData.currentUser.email ? true : false); 
                                deferred.resolve(true);
                            });
                        });
                    }else{
                        output = currentData;
                        deferred.resolve(output);
                    }
                    
                    return deferred.promise;
                }
            };
        });