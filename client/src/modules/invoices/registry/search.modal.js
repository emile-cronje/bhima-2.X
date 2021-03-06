angular.module('bhima.controllers')
  .controller('InvoiceRegistrySearchModalController', InvoiceRegistrySearchModalController);

InvoiceRegistrySearchModalController.$inject = [
  '$uibModalInstance', 'ServiceService', 'filters',
  'NotifyService', 'moment', 'bhConstants', 'DebtorGroupService'
];

/**
 * @class InvoiceRegistrySearchModalController
 *
 * @description
 * This controller is responsible to collecting data from the search form and
 * returning it as a JSON object to the parent controller.  The data can be
 * preset by passing in a filters object using filtersProvider().
 */
function InvoiceRegistrySearchModalController(ModalInstance, Services, filters, Notify, moment, bhConstants, DebtorGroups) {
  var vm = this;

  // set controller data
  vm.params = angular.copy(filters || {});
  vm.today = new Date();

  // @FIXME patch hack - this should be handled by FilterService
  delete(vm.params.defaultPeriod);

  // set controller methods
  vm.submit = submit;
  vm.clear = clear;
  vm.cancel = function () { ModalInstance.close(); };

  fetchDependencies();

  function fetchDependencies() {

    Services.read()
      .then(function (services) {
        vm.services = services;
      })
      .catch(Notify.handleError);

  }

  DebtorGroups.read()
    .then(function (result) {
      vm.debtorGroups = result;
    });

  // custom filter user_id - assign the value to the params object
  vm.onSelectUser = function onSelectUser(user) {
    vm.params.user_id = user.id;
  };

  // submit the filter object to the parent controller.
  function submit(form) {
    if (form.$invalid) { return; }

    //to get it deleted at the for loop below
    var parameters = angular.copy(vm.params);
    
    // to get the format of data from Database
    var formatDB = bhConstants.dates.formatDB;

    // convert dates to strings
    if (parameters.billingDateFrom) {
      parameters.billingDateFrom = moment(parameters.billingDateFrom).format(formatDB);
    }

    if (parameters.billingDateTo) {
      parameters.billingDateTo = moment(parameters.billingDateTo).format(formatDB);
    }

    // make sure we don't have any undefined or empty parameters
    angular.forEach(parameters, function (value, key) {
      if (value === null || value === '') {
        delete parameters[key];
      }
    });

    return ModalInstance.close(parameters);
  }

  // clears search parameters.  Custom logic if a date is used so that we can
  // clear two properties.
  function clear(value) {
    if (value === 'date') {
      delete vm.params.billingDateFrom;
      delete vm.params.billingDateTo;
    } else {
      delete vm.params[value];
    }
  }
}
