angular.module('starter.services', [])
        
        .factory('Auth', function ($firebaseAuth, $rootScope) {
            var ref = new Firebase("https://myexpenses.firebaseio.com/")
            return $firebaseAuth(ref); 
        })

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

            $rootScope.notify = function (title, text) {
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

                } else {
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
                    usersRef.once("value", function (snap) {
                        if (snap.val() === null) {
                            deferred.resolve(true);
                        } else {
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
                    } else {
                        var err = 'TEST';
                        deferred.reject(err);
                    }
                    return deferred.promise;
                },
                
                refreshData: function () {
                    var output = {};
                    var deferred = $q.defer();
                    var authData = ref.getAuth();
                    if (authData) {
                        var usersRef = refRoomMates.child(escapeEmailAddress(authData.password.email));
                        usersRef.once("value", function (snap) {
                            output.currentUser = snap.val();
                            var housesRef = refHouses.child(output.currentUser.houseid);
                            housesRef.once("value", function (snap) {
                                output.currentHouse = snap.val();
                                output.currentHouse.id = housesRef.key();
                                output.isadmin = (output.currentHouse.admin === output.currentUser.email ? true : false);
                                deferred.resolve(output);
                            });
                        });
                    } else {
                        output = currentData;
                        deferred.resolve(output);
                    }
                    return deferred.promise;
                }
            }

        })
        
        
        .factory('UserData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {
            
            var ref = new Firebase("https://myexpenses.firebaseio.com/roommates");

            return {
               
                getRoomMate: function (email) {
                    console.log(email);
                    var deferred = $q.defer();
                    var usersRef = ref.child(escapeEmailAddress(email));
                    console.log(usersRef);
                    usersRef.once("value", function (snap) {
                        deferred.resolve(snap.val());
                    });
                    return deferred.promise;
                },
                
                getRoomMates: function (id) {
                    var deferred = $q.defer();
                    var output = {};
                    ref.once('value', function (snap) {
                        console.log(snap.val());
                        deferred.resolve(snap.val());
                    });
                    return deferred.promise;
                },
              
                addRoomMate: function () {
                    
                }     
            }
        })
        
        .factory('ExpensesData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth, $q) {
            
            var ref = new Firebase("https://myexpenses.firebaseio.com/expenses");

            return {
               
                getExpense: function () {
                   
                },
                
                getExpenses: function (id) {
                    var deferred = $q.defer();
                    var output = {};
                    ref.once('value', function (snap) {
                        deferred.resolve(snap.val());
                    });
                    return deferred.promise;
                },
              
                addExpense: function (expense) {
                    var deferred = $q.defer();
                    var output = {};
                    
                    var sync = $firebase(ref);
                    sync.$push(expense).then(function(data) {
                        deferred.resolve(data);
                    }, function(error){
                        deferred.reject(error);
                    });
                    
                    return deferred.promise;
                }     
            }
        })
   
   