// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Server, Component} from '../../index';
import {Context, Constructor} from '@loopback/context';

describe('Application', () => {
  describe('server binding', () => {
    it('defaults to constructor name', async () => {
      const app = new Application();
      app.server(FakeServer);
      const result = await app.getServer(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows custom name', async () => {
      const app = new Application();
      const name = 'customName';
      app.server(FakeServer, name);
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });
  });

  describe('configuration', () => {
    it('allows bindings to be set via config method', async () => {
      // tslint:disable-next-line:no-any
      const samoflange: any = {
        vertices: 'many',
        usefulness: 0,
      };
      const app = new Application({
        magicCode: 'foobar',
        servers: {
          abc123: FakeServer,
        },
        CustomComponentCo: {
          samoflange: samoflange,
        },
      });
      const code = await app.get('magicCode');
      const server = (await app.getServer('abc123')) as FakeServer;
      expect(code).to.equal('foobar');
      expect(server.constructor.name).to.equal(FakeServer.name);
      const samo = await app.get('CustomComponentCo.samoflange');
      for (const key in samo) {
        expect(samo[key]).to.equal(samoflange[key]);
      }
      const vertices = await app.get('CustomComponentCo.samoflange#vertices');
      expect(vertices).to.equal('many');
    });

    it('allows servers to be provided via config', async () => {
      const name = 'abc123';
      const app = new Application({
        servers: {
          abc123: FakeServer,
        },
      });
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    describe('start', () => {
      it('starts all injected servers', async () => {
        const app = new Application({
          components: [FakeComponent],
        });

        await app.start();
        const server = await app.getServer(FakeServer);
        expect(server).to.not.be.null();
        expect(server.running).to.equal(true);
        await app.stop();
      });

      it('does not attempt to start poorly named bindings', async () => {
        const app = new Application({
          components: [FakeComponent],
        });

        // The app.start should not attempt to start this binding.
        app.bind('controllers.servers').to({});
        await app.start();
        await app.stop();
      });
    });
  });
});

class FakeComponent implements Component {
  servers: {
    [name: string]: Constructor<Server>;
  };
  constructor() {
    this.servers = {
      FakeServer,
      FakeServer2: FakeServer,
    };
  }
}

class FakeServer extends Context implements Server {
  running: boolean = false;
  constructor() {
    super();
  }
  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }
}
