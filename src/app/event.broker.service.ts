import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject }    from 'rxjs/Subject';

interface IEventListener {
    ignore() : void;
}
interface IBrokeredEventBase {
    name:string;
    emit( data: any ): void;
    listen( next: (data: any) => void ): IEventListener;
}
interface IBrokeredEvent<T> extends IBrokeredEventBase  {
    emit( data: any ): void;
    listen( next: (data: any) => void ): IEventListener;
}
class EventListener implements IEventListener {
    constructor( public _subscription: Subscription ) {
    }
    public ignore() : void {
        this._subscription.unsubscribe();
    }
}

class BrokeredEvent<T> implements IBrokeredEvent<T> {
    _subject: Subject<T>;
    constructor( public name: string ) {
        this._subject = new Subject<T>();
    }
    public emit( data: T ): void {
        this._subject.next(data);
    }
    public listen(next: (value: T) => void): IEventListener {
        return new EventListener(this._subject.subscribe( next ));
    }
}
@Injectable()
export class EventBrokerService {
    //_events: { [name: string]: IBrokeredEventBase };
    _events: any;
    
    constructor() {
        this._events = {};
    }
    public register<T>(eventName: string ) : any {//BrokeredEvent<T>
        var event = this._events[eventName];
        if ( typeof event === 'undefined' ) {
            event = this._events[eventName] = new BrokeredEvent<T>(eventName);
        }
        return event as BrokeredEvent<T>;
    }
    public listen<T>(eventName: string, next: (value: T) => void) : any {//IEventListener
        return this.register<T>(eventName).listen(next);
    }
    public emit<T>(eventName: string, data: T) : void {
        return this.register<T>(eventName).emit(data);
    }
}