import { useState, useRef } from "react";
import QRCode from "qrcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

export default function Index() {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedSeat, setSelectedSeat] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [busRoutes, setBusRoutes] = useState([
    {
      id: "1",
      route: "Нижний Новгород - Арзамас",
      time: "08:00",
      price: 180,
      seats: 12,
    },
    {
      id: "2",
      route: "Нижний Новгород - Дзержинск",
      time: "09:30",
      price: 120,
      seats: 8,
    },
    {
      id: "3",
      route: "Нижний Новгород - Выкса",
      time: "10:15",
      price: 220,
      seats: 15,
    },
    {
      id: "4",
      route: "Нижний Новгород - Павлово",
      time: "11:00",
      price: 150,
      seats: 5,
    },
  ]);
  const [trainRoutes, setTrainRoutes] = useState([
    {
      id: "1",
      route: "Нижний Новгород - Москва",
      time: "06:45",
      price: 850,
      seats: 24,
    },
    {
      id: "2",
      route: "Нижний Новгород - Казань",
      time: "07:20",
      price: 720,
      seats: 18,
    },
    {
      id: "3",
      route: "Нижний Новгород - Киров",
      time: "08:40",
      price: 650,
      seats: 12,
    },
    {
      id: "4",
      route: "Нижний Новгород - Арзамас",
      time: "09:15",
      price: 220,
      seats: 32,
    },
  ]);
  const [newRoute, setNewRoute] = useState({
    route: "",
    time: "",
    price: 0,
    seats: 0,
    type: "bus",
  });
  const [bookingData, setBookingData] = useState({
    email: "",
    phone: "",
    passengers: 1,
    selectedRoute: "",
    transportType: "bus",
  });
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Функции для админки
  const handleAdminLogin = () => {
    if (adminPassword === "npk2024admin") {
      setIsAdmin(true);
      setAdminPassword("");
    } else {
      alert("Неверный пароль!");
    }
  };

  const handleAddRoute = () => {
    if (
      newRoute.route &&
      newRoute.time &&
      newRoute.price > 0 &&
      newRoute.seats > 0
    ) {
      const newId = (
        Math.max(
          ...(newRoute.type === "bus" ? busRoutes : trainRoutes).map((r) =>
            parseInt(r.id),
          ),
        ) + 1
      ).toString();
      const route = {
        id: newId,
        route: newRoute.route,
        time: newRoute.time,
        price: newRoute.price,
        seats: newRoute.seats,
      };

      if (newRoute.type === "bus") {
        setBusRoutes([...busRoutes, route]);
      } else {
        setTrainRoutes([...trainRoutes, route]);
      }

      setNewRoute({ route: "", time: "", price: 0, seats: 0, type: "bus" });
      alert("Маршрут добавлен!");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.split("\n");
          const newRoutes = lines
            .slice(1)
            .map((line, index) => {
              const [route, time, price, seats] = line.split(",");
              return {
                id: (
                  busRoutes.length +
                  trainRoutes.length +
                  index +
                  1
                ).toString(),
                route: route?.trim() || "",
                time: time?.trim() || "",
                price: parseInt(price?.trim() || "0"),
                seats: parseInt(seats?.trim() || "0"),
              };
            })
            .filter((route) => route.route && route.time);

          if (newRoute.type === "bus") {
            setBusRoutes([...busRoutes, ...newRoutes]);
          } else {
            setTrainRoutes([...trainRoutes, ...newRoutes]);
          }
          alert(`Загружено ${newRoutes.length} маршрутов`);
        } catch (error) {
          alert("Ошибка загрузки файла");
        }
      };
      reader.readAsText(file);
    }
  };

  // Функция генерации QR-кода и отправки билета
  const generateTicket = async () => {
    if (!bookingData.email || !bookingData.selectedRoute) {
      alert("Заполните все поля!");
      return;
    }

    const ticketId = `NPK-${Date.now()}`;
    const selectedRouteData =
      bookingData.transportType === "bus"
        ? busRoutes.find((r) => r.id === bookingData.selectedRoute)
        : trainRoutes.find((r) => r.id === bookingData.selectedRoute);

    const ticketData = {
      id: ticketId,
      route: selectedRouteData?.route,
      time: selectedRouteData?.time,
      price: selectedRouteData?.price,
      passengers: bookingData.passengers,
      email: bookingData.email,
      phone: bookingData.phone,
      type: bookingData.transportType,
      date: new Date().toLocaleDateString("ru-RU"),
    };

    try {
      // Генерация QR-кода
      const qrCodeData = JSON.stringify(ticketData);
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrCodeDataURL);
      setTicketGenerated(true);

      // Имитация отправки на email
      setTimeout(() => {
        alert(
          `Билет отправлен на ${bookingData.email}!\nID билета: ${ticketId}`,
        );
      }, 1000);
    } catch (error) {
      alert("Ошибка генерации билета");
    }
  };

  const liveBoard = [
    {
      route: "Автобус №101",
      destination: "Арзамас",
      status: "В пути",
      delay: "5 мин",
    },
    {
      route: "Автобус №205",
      destination: "Дзержинск",
      status: "Прибыл",
      delay: "",
    },
    {
      route: "Электропоезд",
      destination: "Москва",
      status: "Отправился",
      delay: "2 мин",
    },
    {
      route: "Автобус №310",
      destination: "Выкса",
      status: "Ожидание",
      delay: "",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-npk-gray-light to-white">
      {/* Header */}
      <header className="bg-npk-black text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-npk-yellow rounded-lg flex items-center justify-center">
                <Icon name="Bus" size={24} className="text-npk-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">НПК</h1>
                <p className="text-sm text-npk-gray">
                  Нижегородская Пассажирская Компания
                </p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a
                href="#home"
                className="hover:text-npk-yellow transition-colors"
              >
                Главная
              </a>
              <a
                href="#about"
                className="hover:text-npk-yellow transition-colors"
              >
                О компании
              </a>
              <a
                href="#bus-schedule"
                className="hover:text-npk-yellow transition-colors"
              >
                Автобусы
              </a>
              <a
                href="#train-schedule"
                className="hover:text-npk-yellow transition-colors"
              >
                Электропоезда
              </a>
              <a
                href="#live-board"
                className="hover:text-npk-yellow transition-colors"
              >
                Табло
              </a>
              {isAdmin && (
                <a
                  href="#admin"
                  className="hover:text-npk-yellow transition-colors"
                >
                  Админ-панель
                </a>
              )}
            </nav>
            <div className="flex items-center space-x-2">
              {!isAdmin ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-npk-yellow text-npk-yellow hover:bg-npk-yellow hover:text-npk-black"
                    >
                      <Icon name="User" size={16} className="mr-2" />
                      Войти
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Вход для администратора</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-password">Пароль</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Введите пароль администратора"
                        />
                      </div>
                      <Button
                        onClick={handleAdminLogin}
                        className="w-full bg-npk-yellow text-npk-black hover:bg-npk-yellow/90"
                      >
                        Войти
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={() => setIsAdmin(false)}
                  variant="outline"
                  className="border-npk-red text-npk-red hover:bg-npk-red hover:text-white"
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="relative py-20 bg-gradient-to-r from-npk-black to-npk-gray-dark text-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6">
                Единый транспортный узел
                <span className="text-npk-yellow"> Нижегородской области</span>
              </h2>
              <p className="text-xl mb-8 text-gray-300">
                Пассажирские перевозки автобусами и электропоездами. Современные
                решения для комфортных путешествий.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-npk-yellow text-npk-black hover:bg-npk-yellow/90"
                >
                  <Icon name="Ticket" size={20} className="mr-2" />
                  Купить билет
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-npk-black"
                >
                  <Icon name="Clock" size={20} className="mr-2" />
                  Расписание
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <Icon
                      name="Bus"
                      size={32}
                      className="text-npk-yellow mb-4"
                    />
                    <h3 className="font-semibold mb-2">Автобусные маршруты</h3>
                    <p className="text-sm text-gray-300">
                      Городские, пригородные и междугородние перевозки
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <Icon
                      name="Train"
                      size={32}
                      className="text-npk-yellow mb-4"
                    />
                    <h3 className="font-semibold mb-2">
                      Железнодорожное сообщение
                    </h3>
                    <p className="text-sm text-gray-300">
                      Электропоезда по области и за её пределы
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Board Section */}
      <section id="live-board" className="py-16 bg-npk-gray-dark text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <Icon
                name="Radio"
                size={32}
                className="inline mr-3 text-npk-yellow"
              />
              Онлайн табло
            </h2>
            <p className="text-xl text-gray-300">
              Актуальная информация о движении транспорта
            </p>
          </div>

          <div className="bg-npk-black rounded-lg p-8 border-2 border-npk-yellow">
            <div className="grid gap-4">
              {liveBoard.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-npk-gray/20 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-npk-yellow rounded-lg flex items-center justify-center">
                      <Icon
                        name={item.route.includes("Автобус") ? "Bus" : "Train"}
                        size={20}
                        className="text-npk-black"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.route}</h3>
                      <p className="text-gray-300">{item.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        item.status === "В пути"
                          ? "default"
                          : item.status === "Прибыл"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        item.status === "В пути"
                          ? "bg-npk-yellow text-npk-black"
                          : ""
                      }
                    >
                      {item.status}
                    </Badge>
                    {item.delay && (
                      <span className="text-npk-red text-sm">
                        +{item.delay}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transport Schedule Section */}
      <section id="bus-schedule" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-npk-black">
              Расписание и бронирование
            </h2>
            <p className="text-xl text-npk-gray">
              Выберите удобный маршрут и забронируйте места
            </p>
          </div>

          <Tabs defaultValue="buses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="buses" className="text-lg">
                <Icon name="Bus" size={20} className="mr-2" />
                Автобусы
              </TabsTrigger>
              <TabsTrigger value="trains" className="text-lg">
                <Icon name="Train" size={20} className="mr-2" />
                Электропоезда
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buses">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon
                        name="Bus"
                        size={24}
                        className="mr-2 text-npk-yellow"
                      />
                      Автобусные маршруты
                    </CardTitle>
                    <CardDescription>
                      Городские и междугородние перевозки
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {busRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-npk-gray-light transition-colors"
                        >
                          <div>
                            <h3 className="font-semibold">{route.route}</h3>
                            <p className="text-sm text-npk-gray">
                              Отправление: {route.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-npk-yellow">
                              {route.price} ₽
                            </p>
                            <p className="text-sm text-npk-gray">
                              Свободно: {route.seats} мест
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Бронирование билета</CardTitle>
                    <CardDescription>
                      Заполните форму для бронирования
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="route">Маршрут</Label>
                        <Select
                          value={bookingData.selectedRoute}
                          onValueChange={(value) =>
                            setBookingData({
                              ...bookingData,
                              selectedRoute: value,
                              transportType: "bus",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите маршрут" />
                          </SelectTrigger>
                          <SelectContent>
                            {busRoutes.map((route) => (
                              <SelectItem key={route.id} value={route.id}>
                                {route.route} - {route.time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="passengers">
                          Количество пассажиров
                        </Label>
                        <Select
                          value={bookingData.passengers.toString()}
                          onValueChange={(value) =>
                            setBookingData({
                              ...bookingData,
                              passengers: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите количество" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 пассажир</SelectItem>
                            <SelectItem value="2">2 пассажира</SelectItem>
                            <SelectItem value="3">3 пассажира</SelectItem>
                            <SelectItem value="4">4 пассажира</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="email">Email для билета</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={bookingData.email}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                          type="tel"
                          placeholder="+7 (999) 999-99-99"
                          value={bookingData.phone}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>

                      <Button
                        onClick={generateTicket}
                        className="w-full bg-npk-yellow text-npk-black hover:bg-npk-yellow/90"
                      >
                        <Icon name="CreditCard" size={16} className="mr-2" />
                        Забронировать и оплатить
                      </Button>

                      {ticketGenerated && qrCodeUrl && (
                        <Card className="mt-4 border-2 border-npk-yellow">
                          <CardHeader>
                            <CardTitle className="text-npk-black flex items-center">
                              <Icon
                                name="CheckCircle"
                                size={20}
                                className="mr-2 text-npk-yellow"
                              />
                              Билет сгенерирован!
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-center">
                            <img
                              src={qrCodeUrl}
                              alt="QR код билета"
                              className="mx-auto mb-4"
                            />
                            <p className="text-sm text-npk-gray mb-2">
                              QR-код для предъявления в транспорте
                            </p>
                            <p className="text-sm font-semibold text-npk-black">
                              Билет отправлен на {bookingData.email}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trains">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon
                        name="Train"
                        size={24}
                        className="mr-2 text-npk-yellow"
                      />
                      Железнодорожные маршруты
                    </CardTitle>
                    <CardDescription>
                      Электропоезда дальнего следования
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {trainRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-npk-gray-light transition-colors"
                        >
                          <div>
                            <h3 className="font-semibold">{route.route}</h3>
                            <p className="text-sm text-npk-gray">
                              Отправление: {route.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-npk-yellow">
                              {route.price} ₽
                            </p>
                            <p className="text-sm text-npk-gray">
                              Свободно: {route.seats} мест
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Бронирование билета</CardTitle>
                    <CardDescription>
                      Заполните форму для бронирования
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="train-route">Маршрут</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите маршрут" />
                          </SelectTrigger>
                          <SelectContent>
                            {trainRoutes.map((route) => (
                              <SelectItem key={route.id} value={route.id}>
                                {route.route} - {route.time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="car-type">Тип вагона</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Общий</SelectItem>
                            <SelectItem value="comfort">Комфорт</SelectItem>
                            <SelectItem value="business">Бизнес</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="email">Email для билета</Label>
                        <Input type="email" placeholder="your@email.com" />
                      </div>

                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input type="tel" placeholder="+7 (999) 999-99-99" />
                      </div>

                      <Button className="w-full bg-npk-yellow text-npk-black hover:bg-npk-yellow/90">
                        <Icon name="CreditCard" size={16} className="mr-2" />
                        Забронировать и оплатить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-npk-gray-light">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-npk-black">
                О компании
              </h2>
              <p className="text-lg text-npk-gray mb-6">
                ООО "Нижегородская пассажирская компания" — ведущий перевозчик
                Нижегородской области, обеспечивающий качественные пассажирские
                перевозки на муниципальных, пригородных, межмуниципальных,
                городских и междугородних маршрутах.
              </p>
              <p className="text-lg text-npk-gray mb-6">
                В ближайшем будущем мы планируем запуск железнодорожного
                сообщения, создав единый транспортный узел для максимального
                удобства пассажиров.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-npk-yellow mb-2">
                    50+
                  </h3>
                  <p className="text-npk-gray">Автобусных маршрутов</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-npk-yellow mb-2">
                    24/7
                  </h3>
                  <p className="text-npk-gray">Круглосуточное обслуживание</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-npk-yellow mb-2">
                    15+
                  </h3>
                  <p className="text-npk-gray">Лет опыта работы</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-npk-yellow mb-2">
                    1000+
                  </h3>
                  <p className="text-npk-gray">Довольных клиентов</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <img
                  src="/img/38f3240c-81e1-4e9a-ba49-8ab9eca4b339.jpg"
                  alt="Автобус НПК"
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
                />
                <h3 className="text-lg font-semibold mt-4 text-npk-black">
                  Современный автопарк
                </h3>
                <p className="text-npk-gray">
                  Комфортабельные автобусы с кондиционерами
                </p>
              </div>
              <div>
                <img
                  src="/img/ae78b981-aead-4330-bbed-d927c6178c75.jpg"
                  alt="Электропоезд"
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
                />
                <h3 className="text-lg font-semibold mt-4 text-npk-black">
                  Железнодорожное сообщение
                </h3>
                <p className="text-npk-gray">Скоро: электропоезда по области</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-npk-black">
              Наши услуги
            </h2>
            <p className="text-xl text-npk-gray">
              Полный спектр транспортных услуг
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-npk-yellow/20 hover:border-npk-yellow transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-npk-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="MapPin" size={32} className="text-npk-black" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-npk-black">
                  Городские маршруты
                </h3>
                <p className="text-npk-gray">
                  Регулярные рейсы по городу с удобными остановками
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-npk-yellow/20 hover:border-npk-yellow transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-npk-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    name="Navigation"
                    size={32}
                    className="text-npk-black"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-npk-black">
                  Междугородние рейсы
                </h3>
                <p className="text-npk-gray">
                  Комфортные поездки между городами области
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-npk-yellow/20 hover:border-npk-yellow transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-npk-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    name="Smartphone"
                    size={32}
                    className="text-npk-black"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-npk-black">
                  Онлайн-сервисы
                </h3>
                <p className="text-npk-gray">
                  Бронирование билетов и отслеживание транспорта
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-npk-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-npk-yellow rounded-lg flex items-center justify-center">
                  <Icon name="Bus" size={24} className="text-npk-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">НПК</h3>
                  <p className="text-sm text-npk-gray">
                    Нижегородская Пассажирская Компания
                  </p>
                </div>
              </div>
              <p className="text-npk-gray">
                Качественные пассажирские перевозки по Нижегородской области
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-npk-gray">
                <p className="flex items-center">
                  <Icon name="Phone" size={16} className="mr-2" />
                  +7 (831) 123-45-67
                </p>
                <p className="flex items-center">
                  <Icon name="Mail" size={16} className="mr-2" />
                  info@npk-nn.ru
                </p>
                <p className="flex items-center">
                  <Icon name="MapPin" size={16} className="mr-2" />
                  г. Нижний Новгород
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Услуги</h4>
              <ul className="space-y-2 text-npk-gray">
                <li>Автобусные перевозки</li>
                <li>Железнодорожное сообщение</li>
                <li>Онлайн-бронирование</li>
                <li>Корпоративные перевозки</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Режим работы</h4>
              <div className="space-y-2 text-npk-gray">
                <p>Пн-Пт: 06:00 - 23:00</p>
                <p>Сб-Вс: 07:00 - 22:00</p>
                <p>Диспетчерская: 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-npk-gray mt-8 pt-8 text-center text-npk-gray">
            <p>
              &copy; 2024 ООО "Нижегородская пассажирская компания". Все права
              защищены.
            </p>
          </div>
        </div>
      </footer>

      {/* Admin Panel */}
      {isAdmin && (
        <section id="admin" className="py-16 bg-npk-gray-dark text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                <Icon
                  name="Settings"
                  size={32}
                  className="inline mr-3 text-npk-yellow"
                />
                Админ-панель
              </h2>
              <p className="text-xl text-gray-300">
                Управление расписанием и маршрутами
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Добавление нового маршрута */}
              <Card className="bg-npk-black border-npk-yellow">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Icon
                      name="Plus"
                      size={24}
                      className="mr-2 text-npk-yellow"
                    />
                    Добавить маршрут
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Создание нового маршрута
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="route-type" className="text-white">
                      Тип транспорта
                    </Label>
                    <Select
                      value={newRoute.type}
                      onValueChange={(value) =>
                        setNewRoute({ ...newRoute, type: value })
                      }
                    >
                      <SelectTrigger className="bg-npk-gray text-white">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Автобус</SelectItem>
                        <SelectItem value="train">Электропоезд</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="route-name" className="text-white">
                      Маршрут
                    </Label>
                    <Input
                      value={newRoute.route}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, route: e.target.value })
                      }
                      placeholder="Нижний Новгород - Москва"
                      className="bg-npk-gray text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="route-time" className="text-white">
                      Время отправления
                    </Label>
                    <Input
                      type="time"
                      value={newRoute.time}
                      onChange={(e) =>
                        setNewRoute({ ...newRoute, time: e.target.value })
                      }
                      className="bg-npk-gray text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="route-price" className="text-white">
                      Цена (₽)
                    </Label>
                    <Input
                      type="number"
                      value={newRoute.price}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          price: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="180"
                      className="bg-npk-gray text-white placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="route-seats" className="text-white">
                      Количество мест
                    </Label>
                    <Input
                      type="number"
                      value={newRoute.seats}
                      onChange={(e) =>
                        setNewRoute({
                          ...newRoute,
                          seats: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="50"
                      className="bg-npk-gray text-white placeholder-gray-400"
                    />
                  </div>

                  <Button
                    onClick={handleAddRoute}
                    className="w-full bg-npk-yellow text-npk-black hover:bg-npk-yellow/90"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить маршрут
                  </Button>
                </CardContent>
              </Card>

              {/* Загрузка расписания из файла */}
              <Card className="bg-npk-black border-npk-yellow">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Icon
                      name="Upload"
                      size={24}
                      className="mr-2 text-npk-yellow"
                    />
                    Загрузка расписания
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Загрузка маршрутов из CSV файла
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="upload-type" className="text-white">
                      Тип транспорта
                    </Label>
                    <Select
                      value={newRoute.type}
                      onValueChange={(value) =>
                        setNewRoute({ ...newRoute, type: value })
                      }
                    >
                      <SelectTrigger className="bg-npk-gray text-white">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Автобус</SelectItem>
                        <SelectItem value="train">Электропоезд</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="csv-file" className="text-white">
                      CSV файл
                    </Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="bg-npk-gray text-white file:bg-npk-yellow file:text-npk-black file:border-0"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Формат: маршрут,время,цена,места
                    </p>
                  </div>

                  <div className="bg-npk-gray p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">
                      Пример CSV:
                    </h4>
                    <pre className="text-sm text-gray-300">
                      {`маршрут,время,цена,места
Нижний Новгород - Москва,06:30,850,45
Нижний Новгород - Казань,07:15,720,40`}
                    </pre>
                  </div>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-npk-yellow text-npk-black hover:bg-npk-yellow/90"
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Выбрать файл для загрузки
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Текущие маршруты */}
            <div className="mt-12">
              <Tabs defaultValue="admin-buses" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-npk-black">
                  <TabsTrigger
                    value="admin-buses"
                    className="text-lg data-[state=active]:bg-npk-yellow data-[state=active]:text-npk-black"
                  >
                    <Icon name="Bus" size={20} className="mr-2" />
                    Автобусы ({busRoutes.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin-trains"
                    className="text-lg data-[state=active]:bg-npk-yellow data-[state=active]:text-npk-black"
                  >
                    <Icon name="Train" size={20} className="mr-2" />
                    Электропоезда ({trainRoutes.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="admin-buses">
                  <Card className="bg-npk-black border-npk-yellow">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Автобусные маршруты
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-npk-gray">
                            <TableHead className="text-npk-yellow">
                              ID
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Маршрут
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Время
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Цена
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Места
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Действия
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {busRoutes.map((route) => (
                            <TableRow
                              key={route.id}
                              className="border-npk-gray"
                            >
                              <TableCell className="text-white">
                                {route.id}
                              </TableCell>
                              <TableCell className="text-white">
                                {route.route}
                              </TableCell>
                              <TableCell className="text-white">
                                {route.time}
                              </TableCell>
                              <TableCell className="text-white">
                                {route.price} ₽
                              </TableCell>
                              <TableCell className="text-white">
                                {route.seats}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    setBusRoutes(
                                      busRoutes.filter(
                                        (r) => r.id !== route.id,
                                      ),
                                    )
                                  }
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="admin-trains">
                  <Card className="bg-npk-black border-npk-yellow">
                    <CardHeader>
                      <CardTitle className="text-white">
                        Железнодорожные маршруты
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-npk-gray">
                            <TableHead className="text-npk-yellow">
                              ID
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Маршрут
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Время
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Цена
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Места
                            </TableHead>
                            <TableHead className="text-npk-yellow">
                              Действия
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trainRoutes.map((route) => (
                            <TableRow
                              key={route.id}
                              className="border-npk-gray"
                            >
                              <TableCell className="text-white">
                                {route.id}
                              </TableCell>
                              <TableCell className="text-white">
                                {route.route}
                              </TableCell>
                              <TableCell className="text-white">
                                {route.time}
                              </TableCell>
                              <TableCell className="text-white">
                                {route.price} ₽
                              </TableCell>
                              <TableCell className="text-white">
                                {route.seats}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    setTrainRoutes(
                                      trainRoutes.filter(
                                        (r) => r.id !== route.id,
                                      ),
                                    )
                                  }
                                >
                                  <Icon name="Trash2" size={14} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
