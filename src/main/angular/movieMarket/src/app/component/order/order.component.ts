import { AddressService } from './../../service/address.service';
import { Address } from './../../model/address';
import { CreditCard } from './../../model/creditCard';
import { AuthenticateService } from './../../service/authenticate.service';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../service/user.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { FormsHelperService } from '../../service/forms-helper.service';
import { User } from '../../model/user';
import { Gender } from '../../model/person';
import { Authenticate } from '../../model/authenticate';
import {OrderService} from '../../service/order.service';
import {CartService} from '../../service/cart.service';
declare var $: any;


@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
    user: User = new User();
    deliveryAddress: Address;
    creditCard: CreditCard = new CreditCard();
    userForm: FormGroup;
    info = null;
    error = null;
    finished = false;
    isLogged = false;
    orderFinished = false;

    showAddressDanger = '';
    showAddressDone = '';

    @Output()
    bought = new EventEmitter<boolean>();

    public steps: Map<string, string>;


    constructor (private userService: UserService,
          public addressService: AddressService,
          public authenticateService: AuthenticateService,
          private formBuilder: FormBuilder,
          public formsHelper: FormsHelperService,
          private orderService: OrderService,
          private cartService: CartService
      ) {

        this.createForm();
        this.steps = new Map<string, string>();
        this.steps.set('start', 'show');
        this.steps.set('connect', '');
        this.steps.set('createAccount1', '');
        this.steps.set('createAccount2', '');
        this.steps.set('address', '');
        this.steps.set('payment', '');
        this.steps.set('address_connected', '');
    }

    createForm() {
        this.userForm = this.formBuilder.group({
            'gender': ['', Validators.required ],
            'lastname': ['', Validators.required ],
            'firstname': ['', Validators.required ],
            'username': ['', Validators.required ],
            'birthday': ['', Validators.required ],
            'cardNumber': ['', Validators.required ], // TODO: make a real validator
            'expirationMonth': ['', Validators.required ],
            'expirationYear': ['', Validators.required ],
            'code': ['', Validators.required ],
            'email': ['', Validators.email ],
            'passwords': this.formBuilder.group({
            'password': [''],
            'confirmPassword': ['']
            }, {validator: this.passwordConfirming})
        });

        this.user.gender = Gender.MR;
        }

    passwordConfirming(control: AbstractControl) {
        if ((control.get('password').value !== control.get('confirmPassword').value) ||
            control.get('password').value.length < 6 && control.get('confirmPassword').value.length < 6) {
            return { passwordConfirming: true };
        }
        return null;
    }

    ngOnInit() {
        if (this.authenticateService.isLogged()) {
            this.userService.find(this.authenticateService.get().id, this.authenticateService.get().token).subscribe(
                value => this.user = value,
                error => this.error = error,
                () => {
                    this.isLogged = true;
                    console.log(this.user);
                    if (this.user.addresses && this.user.addresses.length > 0) {
                        this.deliveryAddress = this.user.addresses[0];
                    }
                    this.showStartConnected(null);
                }
            );
        }
    }

    private setStep(stepName: string) {
        for (const key of Array.from(this.steps.keys())) {
            this.steps.set(key, '');
        }
        this.steps.set(stepName, 'show');
    }

    showStart(event) {
        this.setStep('start');
    }

    showStartConnected(event) {
        this.setStep('address_connected');
    }

    showCreateAccount1(event) {
        this.setStep('createAccount1');
    }

    showCreateAccount2(event) {
        let keepGoing = true;

        const toCheck = ['gender', 'lastname', 'firstname', 'birthday'];
        toCheck.forEach(s => {
            const control = this.userForm.get(s);
            if (control.pristine || control.invalid) {
                keepGoing = false;
                control.markAsTouched({ onlySelf: true });
                control.markAsDirty({ onlySelf: true });
            }
        });

        if (keepGoing) {
            this.setStep('createAccount2');
        }
    }

    showAddress(event) {
        let keepGoing = true;

        const toCheck = ['username', 'email', 'passwords'];
        toCheck.forEach(s => {
            const control = this.userForm.get(s);
            if (control.pristine || control.invalid) {
                keepGoing = false;
                control.markAsTouched({ onlySelf: true });
                control.markAsDirty({ onlySelf: true });
            }
        });

        if (keepGoing) {
            this.setStep('address');
        }
    }

    showPaymentFromCreateAddress(event) {
        if (this.deliveryAddress) {
            this.showAddressDanger = '';
            this.showAddressDone = '';
            this.setStep('payment');
            return;
        }
        this.showAddressDanger = 'show';
    }

    showPaymentFromChooseAddress(event) {
        // Get the selected address
        let keepGoing = true;
        if (!this.deliveryAddress || this.deliveryAddress === null) {
            this.showAddressDanger = 'show';
            this.showAddressDone = '';
            keepGoing = false;
        }
        if (keepGoing) {
         this.setStep('payment');
        }
    }

    showBeforePayment(event) {
        if (this.isLogged) {
            this.showStartConnected(event);
        } else {
            this.setStep('address');
        }
    }

    create() {
        console.log('On avant user form');

        // Do something different if we already were connected
        if (this.isLogged) {
            console.log('On était loggé');
            console.log(this.deliveryAddress);
            if (!this.deliveryAddress.id ) {
                this.userService.find(this.user.id, this.user.jwtToken).subscribe(
                    data => this.user = data ,
                    err => null,
                    () => {
                        this.deliveryAddress = this.user.addresses[this.user.addresses.length - 1];
                        this.orderService.add(
                        this.cartService.get(), this.authenticateService.get().id.toString(),
                        this.deliveryAddress.id.toString(), this.authenticateService.get().token).subscribe(
                            res => console.log('youpi2'),
                            err => this.error = err,
                            () => {
                                this.orderFinished = true;
                                console.log('OrderService3:add complete');
                                this.bought.emit(true);
                            }
                        );
                    }
                );
                return;
            }
            this.orderService.add(
            this.cartService.get(), this.authenticateService.get().id.toString(),
            this.deliveryAddress.id.toString(), this.authenticateService.get().token).subscribe(
                res => console.log('youpi2'),
                err => this.error = err,
                () => {
                    this.orderFinished = true;
                    console.log('OrderService2:add complete');
                    this.bought.emit(true);
                }
            );
            return;
         }

        // Do something if we need to create a new user
        if (this.userForm.valid) {
            console.log('On apsse dans le form vlaide');
            this.userService.create(this.user).subscribe(
                data => this.info = 'Utilisateur créé',
                err => this.error = 'Une erreur serveur est survenue. Veuillez réessayer dans quelques instants',
                () => {
                    let authenticate: Authenticate;
                    const email = this.userForm.get('email').value;
                    const pwd = this.userForm.get('passwords').value;
                    this.userService.login(email, pwd).subscribe(
                        data => {
                            authenticate = data;
                            this.authenticateService.set(authenticate);
                        },
                        err => {
                            this.error = 'Une erreur serveur est survenue. Veuillez réessayer dans quelques instants';
                            if (err.status === 400) {
                                this.error = 'Veuillez remplir tous les champs obligatoires du formulaire';
                            }
                        },
                        () => {
                          this.finished = true;
                          console.log('on devrait etre loggé');

                          this.addressService.add(this.deliveryAddress, authenticate.id.toString(),
                            this.authenticateService.get().token).subscribe(
                            data => {
                              this.info = 'Adresse ajoutée';
                              console.log(data);
                              this.deliveryAddress.id = data;
                            },
                            err => {
                              this.error = 'Une erreur serveur est survenue. Veuillez réessayer dans quelques instants';
                              if (err.status === 400) {
                                this.error = 'Veuillez remplir tous les champs obligatoires du formulaire';
                              }
                            },
                            () => {
                              console.log('OrderService:add call');
                              console.log(authenticate);
                              console.log(this.cartService.get());
                              console.log(this.deliveryAddress);
                              this.orderService.add(
                                  this.cartService.get(), authenticate.id.toString(),
                                this.deliveryAddress.id.toString(), authenticate.token).subscribe(
                                res => console.log('youpi'),
                                err => this.error = err,
                                () => {
                                  this.orderFinished = true;
                                  console.log('OrderService:add complete');
                                  this.bought.emit(true);
                                }
                              );
                            }
                          );
                        }
                    );
                }
            );
        } else {
            Object.keys(this.userForm.controls).forEach(field => {
              const control = this.userForm.get(field);
              if (control.pristine) {
                 console.log(field);
                control.markAsTouched({ onlySelf: true });
                control.markAsDirty({ onlySelf: true });
              }
            });
          }
    }

    createn() {
    }

    setAddress(event: Address) {
        console.log(event);
        this.deliveryAddress = event;
        this.showAddressDone = 'show';
        this.showAddressDanger = '';
    }

    getAddressString(address: Address) {
        return address.streetNumber + ' ' + address.street + ' à ' + address.city + ' (' + address.zipCode + ')';
    }
    setDeliveryAddress(event) {
        this.deliveryAddress = event.target.value;

    }

}
