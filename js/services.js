angular.module('starter.services', [])
        /**
         * A simple example service that returns some data.
         */
        .factory('fireBaseData', function ($firebase, $rootScope, $ionicPopup, $ionicLoading, $state, $firebaseAuth) {
            
            var ref = new Firebase("https://myexpenses.firebaseio.com/"),
            refExpenses = new Firebase("https://myexpenses.firebaseio.com/expenses"),
            refRoomMates = new Firebase("https://myexpenses.firebaseio.com/roommates"),
            refHouses = new Firebase("https://myexpenses.firebaseio.com/houses");

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
                    var usersRef = new Firebase("https://myexpenses.firebaseio.com/roommates").child(escapeEmailAddress(user_email));
                    var sync = $firebase(usersRef);
                    $rootScope.currentUser = sync.$asObject();
                    $rootScope.hide();
                   
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
                }
            };
        });